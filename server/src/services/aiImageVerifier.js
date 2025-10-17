const { GoogleGenerativeAI } = require('@google/generative-ai')
const axios = require('axios')

/**
 * Verify images depict waste/trash and not people/selfies/etc.
 * Returns { allowed: boolean, reasons?: string[] }
 */
async function verifyImagesAreWaste(imageUrls) {
	if (!Array.isArray(imageUrls) || imageUrls.length === 0) {
		return { allowed: false, reasons: ['No images provided'] }
	}

	const apiKey = process.env.GEMINI_API_KEY
	if (!apiKey) {
		// Fail-open if key missing
		return { allowed: true }
	}

	// Add overall timeout for the entire AI verification process
	const timeoutPromise = new Promise((_, reject) => {
		setTimeout(() => reject(new Error('AI verification timeout')), 45000) // 45 second timeout
	})

	try {
		const verificationPromise = (async () => {
			const genAI = new GoogleGenerativeAI(apiKey)
			const model = genAI.getGenerativeModel({ model: 'gemini-pro-vision' })

			// Fetch image bytes and run a concise classification prompt
			const imageParts = []
			for (const url of imageUrls) {
				const res = await axios.get(url, { 
					responseType: 'arraybuffer',
					timeout: 30000 // 30 second timeout for image download
				})
				// Infer mime type from content-type header
				const mime = res.headers['content-type'] || 'image/jpeg'
				imageParts.push({ inlineData: { data: Buffer.from(res.data).toString('base64'), mimeType: mime } })
			}

			const prompt = `You are classifying uploaded photos for a city waste reporting app.
Return one JSON object only with fields: allowed (boolean) and reasons (array of short strings).
allowed should be true only if the images clearly depict waste/trash/garbage/litter or dumping scenes.
Disallow selfies, portraits, unrelated objects, animals, landscapes with no trash, paperwork screenshots, etc.
Be strict if humans are the main subject.
Examples of ALLOWED images: piles of garbage, litter on streets, waste bins overflowing, construction debris, electronic waste, etc.
Examples of DISALLOWED images: selfies, portraits, people as main subject, clean landscapes, animals, documents, etc.`;

			const result = await model.generateContent([
				{ text: prompt },
				...imageParts,
			])
			const text = result.response.text()
			console.log('AI Response:', text) // Debug logging
			
			let parsed
			try {
				parsed = JSON.parse(text)
			} catch (parseErr) {
				console.warn('Failed to parse AI response as JSON:', text)
				// Basic fallback parsing; fail closed to be safe
				return { allowed: false, reasons: ['AI response unparseable'] }
			}
			
			if (typeof parsed?.allowed === 'boolean') {
				console.log('AI Decision:', parsed)
				return { allowed: parsed.allowed, reasons: Array.isArray(parsed.reasons) ? parsed.reasons : undefined }
			}
			return { allowed: false, reasons: ['AI response invalid'] }
		})()

		// Race between verification and timeout
		return await Promise.race([verificationPromise, timeoutPromise])
	} catch (err) {
		// On AI errors, fail-open to avoid blocking legitimate users due to transient issues
		console.warn('[AI Verify] error:', err?.message || String(err))
		if (process.env.NODE_ENV === 'development') {
			console.error('Full error:', err)
		}
		return { allowed: true }
	}
}

module.exports = { verifyImagesAreWaste }


