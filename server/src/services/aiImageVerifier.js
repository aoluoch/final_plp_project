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

	try {
		const genAI = new GoogleGenerativeAI(apiKey)
		const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

		// Fetch image bytes and run a concise classification prompt
		const imageParts = []
		for (const url of imageUrls) {
			const res = await axios.get(url, { responseType: 'arraybuffer' })
			// Infer mime type from content-type header
			const mime = res.headers['content-type'] || 'image/jpeg'
			imageParts.push({ inlineData: { data: Buffer.from(res.data).toString('base64'), mimeType: mime } })
		}

		const prompt = `You are classifying uploaded photos for a city waste reporting app.
	Return one JSON object only with fields: allowed (boolean) and reasons (array of short strings).
	allowed should be true only if the images clearly depict waste/trash/garbage/litter or dumping scenes.
	Disallow selfies, portraits, unrelated objects, animals, landscapes with no trash, paperwork screenshots, etc.
	Be strict if humans are the main subject.
	`;

		const result = await model.generateContent([
			{ text: prompt },
			...imageParts,
		])
		const text = result.response.text()
		let parsed
		try {
			parsed = JSON.parse(text)
		} catch {
			// Basic fallback parsing; fail closed to be safe
			return { allowed: false, reasons: ['AI response unparseable'] }
		}
		if (typeof parsed?.allowed === 'boolean') {
			return { allowed: parsed.allowed, reasons: Array.isArray(parsed.reasons) ? parsed.reasons : undefined }
		}
		return { allowed: false, reasons: ['AI response invalid'] }
	} catch (err) {
		// On AI errors, fail-open to avoid blocking legitimate users due to transient issues
		if (process.env.NODE_ENV === 'development') {
			console.warn('[AI Verify] error:', err?.message || String(err))
		}
		return { allowed: true }
	}
}

module.exports = { verifyImagesAreWaste }


