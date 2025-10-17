import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import MapView from '../../components/MapView'
import { WASTE_TYPES, PRIORITY_LEVELS } from '../../utils/constants'
import { validators } from '../../utils/validators'
import { useMap } from '../../hooks/useMap'
import { useToast } from '../../context/ToastContext'
import { reportsApi } from '../../api/reportsApi'

const ReportForm: React.FC = () => {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    type: '',
    description: '',
    estimatedVolume: '',
    notes: '',
    priority: 'medium',
  })
  const [images, setImages] = useState<File[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<string>('')

  const { selectedLocation, handleMapClick, getCurrentLocation, setSelectedLocation } = useMap({
    onLocationChange: (coordinates) => {
      console.log('Location selected:', coordinates.lat, coordinates.lng)
    },
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const validFiles = files.filter(file => {
      const sizeError = validators.fileSize(5 * 1024 * 1024)(file)
      const typeError = validators.fileType([
        'image/jpeg', 
        'image/jpg', 
        'image/png', 
        'image/webp', 
        'image/gif', 
        'image/bmp', 
        'image/tiff', 
        'image/svg+xml', 
        'image/x-icon', 
        'image/vnd.microsoft.icon'
      ])(file)
      return !sizeError && !typeError
    })
    
    setImages(prev => [...prev, ...validFiles].slice(0, 5))
  }

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index))
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    const typeError = validators.required(formData.type)
    if (typeError) newErrors.type = typeError

    const descriptionError = validators.required(formData.description)
    if (descriptionError) newErrors.description = descriptionError

    const volumeError = validators.required(formData.estimatedVolume)
    if (volumeError) newErrors.estimatedVolume = volumeError

    if (!selectedLocation) {
      newErrors.location = 'Please select a location on the map'
    }
    
    if (!selectedAddress.trim()) {
      newErrors.address = 'Please enter an address for the selected location'
    }

    if (images.length < 2) {
      newErrors.images = 'Please upload at least 2 images'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    if (!selectedLocation) {
      showToast({ message: 'Please select a location on the map', type: 'error' })
      return
    }

    if (!selectedAddress) {
      showToast({ message: 'Please enter an address for the selected location', type: 'error' })
      return
    }

    try {
      setIsLoading(true)
      
      // Debug logging
      console.log('Form data:', formData)
      console.log('Selected location:', selectedLocation)
      console.log('Selected address:', selectedAddress)
      console.log('Images count:', images.length)
      
      // Create FormData for multipart/form-data request
      const formDataToSend = new FormData()
      formDataToSend.append('type', formData.type)
      formDataToSend.append('description', formData.description)
      
      // Send location as JSON string to avoid parsing issues
      const locationData = {
        address: selectedAddress,
        coordinates: {
          lat: selectedLocation.lat,
          lng: selectedLocation.lng
        }
      }
      formDataToSend.append('location', JSON.stringify(locationData))
      
      formDataToSend.append('estimatedVolume', formData.estimatedVolume)
      formDataToSend.append('priority', formData.priority)
      if (formData.notes) {
        formDataToSend.append('notes', formData.notes)
      }
      
      // Add images
      images.forEach((image) => {
        formDataToSend.append('images', image)
      })
      
      // Debug FormData contents
      console.log('FormData contents:')
      for (const [key, value] of formDataToSend.entries()) {
        console.log(key, value)
      }
      
      // Call the API
      await reportsApi.create(formDataToSend)
      
      showToast({ message: 'Waste report submitted successfully!', type: 'success' })
      navigate('/resident/dashboard')
    } catch (error: unknown) {
      console.error('Error creating report:', error)
      
      // Handle validation errors from the server
      if (error && typeof error === 'object' && 'errors' in error) {
        const validationError = error as { message: string; errors?: Record<string, string[]> }
        console.error('Validation errors:', validationError.errors)
        
        // Show the first validation error if errors exist
        let errorMessage = validationError.message || 'Validation failed'
        if (validationError.errors && typeof validationError.errors === 'object') {
          const firstError = Object.values(validationError.errors)[0]?.[0]
          if (firstError) {
            errorMessage = firstError
          }
        }
        
        showToast({ 
          message: errorMessage, 
          type: 'error' 
        })
      } else {
        const errorMessage = error instanceof Error ? error.message : 'Failed to submit waste report. Please try again.'
        showToast({ message: errorMessage, type: 'error' })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Report Waste Issue
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Waste Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Waste Type *
            </label>
            <select
              name="type"
              value={formData.type}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select waste type</option>
              {WASTE_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Describe the waste issue..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description}</p>
            )}
          </div>

          {/* Volume and Priority */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Estimated Volume (cubic feet) *
              </label>
              <input
                type="number"
                name="estimatedVolume"
                value={formData.estimatedVolume}
                onChange={handleChange}
                min="1"
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.estimatedVolume ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Enter volume"
              />
              {errors.estimatedVolume && (
                <p className="mt-1 text-sm text-red-600">{errors.estimatedVolume}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              >
                {PRIORITY_LEVELS.map(priority => (
                  <option key={priority.value} value={priority.value}>
                    {priority.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Location *
            </label>
            <div className="space-y-4">
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={getCurrentLocation}
                >
                  Use Current Location
                </Button>
                {selectedLocation && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => setSelectedLocation(null)}
                  >
                    Clear Location
                  </Button>
                )}
              </div>
              
              <div className="h-96 rounded-lg overflow-hidden">
                <MapView
                  onMapClick={handleMapClick}
                  markers={selectedLocation ? [{
                    id: 'selected',
                    position: selectedLocation,
                    title: 'Selected Location',
                    color: '#3B82F6',
                  }] : []}
                  height="100%"
                />
              </div>
              
              {selectedLocation && (
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Selected: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}
                </p>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={selectedAddress}
                  onChange={(e) => setSelectedAddress(e.target.value)}
                  placeholder="Enter the address for the selected location"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.address}</p>
                )}
              </div>
              
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photos (Minimum 2)
            </label>
            <input
              type="file"
              multiple
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif,image/bmp,image/tiff,image/svg+xml,image/x-icon,image/vnd.microsoft.icon"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload at least 2 and up to 5 images (max 5MB each). Supported formats: JPEG, PNG, WebP, GIF, BMP, TIFF, SVG, ICO
            </p>
            {errors.images && (
              <p className="mt-1 text-sm text-red-600">{errors.images}</p>
            )}
            
            {images.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={URL.createObjectURL(image)}
                      alt={`Upload ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Additional Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Any additional information..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/resident/dashboard')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={isLoading}
            >
              Submit Report
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportForm
