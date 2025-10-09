import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Button from '../../components/Button'
import MapView from '../../components/MapView'
import { WASTE_TYPES, PRIORITY_LEVELS } from '../../utils/constants'
import { validators } from '../../utils/validators'
import { useMap } from '../../hooks/useMap'

const ReportForm: React.FC = () => {
  const navigate = useNavigate()
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

  const { selectedLocation, handleMapClick, getCurrentLocation } = useMap({
    onLocationChange: (coordinates) => {
      console.log('Location selected:', coordinates)
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
      const typeError = validators.fileType(['image/jpeg', 'image/png', 'image/webp'])(file)
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

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      setIsLoading(true)
      
      // Here you would call the API to create the report
      console.log('Creating report:', {
        ...formData,
        location: selectedLocation,
        images,
      })
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      navigate('/resident/dashboard')
    } catch (error) {
      console.error('Error creating report:', error)
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
                    onClick={() => console.log('Clear location')}
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
              
              {errors.location && (
                <p className="text-sm text-red-600">{errors.location}</p>
              )}
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Photos (Optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Upload up to 5 images (max 5MB each)
            </p>
            
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
