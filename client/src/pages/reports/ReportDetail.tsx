import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi } from '../../api/reportsApi'
import Button from '../../components/Button'
import MapView from '../../components/MapView'

const ReportDetail: React.FC = () => {
	const { id = '' } = useParams()
	const navigate = useNavigate()
	const qc = useQueryClient()
	const { data: report, isLoading } = useQuery({ queryKey: ['reports','detail', id], queryFn: () => reportsApi.getById(id), enabled: Boolean(id) })
	const [description, setDescription] = useState('')
	const [notes, setNotes] = useState('')

	const updateMutation = useMutation({
		mutationFn: (payload: { description?: string; notes?: string }) => reportsApi.updateMine(id, payload),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['reports','detail', id] })
	})
	const deleteMutation = useMutation({
		mutationFn: () => reportsApi.delete(id),
		onSuccess: () => navigate('/reports')
	})

	if (isLoading || !report) return <div>Loading report...</div>

	return (
		<div className="max-w-4xl mx-auto space-y-6">
			<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
				<div className="flex items-start justify-between mb-4">
					<div>
						<h1 className="text-2xl font-bold capitalize">{report.type} Waste Report</h1>
						<div className="flex items-center gap-2 mt-2">
							<span className={`px-3 py-1 text-sm rounded-full ${
								report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
								report.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
								report.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
								report.status === 'completed' ? 'bg-green-100 text-green-800' :
								'bg-red-100 text-red-800'
							}`}>
								{report.status.replace('_', ' ')}
							</span>
							<span className={`px-3 py-1 text-sm rounded-full ${
								report.priority === 'low' ? 'bg-gray-100 text-gray-800' :
								report.priority === 'medium' ? 'bg-blue-100 text-blue-800' :
								report.priority === 'high' ? 'bg-orange-100 text-orange-800' :
								'bg-red-100 text-red-800'
							}`}>
								{report.priority} priority
							</span>
						</div>
					</div>
					<div className="text-sm text-gray-500">
						Created: {new Date(report.createdAt).toLocaleString()}
					</div>
				</div>

				<div className="grid md:grid-cols-2 gap-6">
					<div>
						<h3 className="font-semibold mb-2">Description</h3>
						<p className="text-gray-700 dark:text-gray-300">{report.description}</p>
						
						{report.notes && (
							<div className="mt-4">
								<h3 className="font-semibold mb-2">Notes</h3>
								<p className="text-gray-700 dark:text-gray-300">{report.notes}</p>
							</div>
						)}
					</div>

					<div>
						<h3 className="font-semibold mb-2">Location</h3>
						<div className="space-y-2">
							<p className="text-gray-700 dark:text-gray-300">
								📍 {report.location?.address || 'Location not available'}
							</p>
							{report.location?.coordinates && (
								<p className="text-sm text-gray-500">
									Coordinates: {report.location.coordinates.lat.toFixed(6)}, {report.location.coordinates.lng.toFixed(6)}
								</p>
							)}
						</div>

						<div className="mt-4">
							<h3 className="font-semibold mb-2">Details</h3>
							<div className="space-y-1 text-sm">
								<p><span className="font-medium">Volume:</span> {report.estimatedVolume} m³</p>
								<p><span className="font-medium">Reported by:</span> {report.userId?.firstName} {report.userId?.lastName}</p>
								<p><span className="font-medium">Email:</span> {report.userId?.email}</p>
							</div>
						</div>
					</div>
				</div>

				{/* Map View Section */}
				<div className="mt-6">
					<h3 className="font-semibold mb-3">Location Map</h3>
					{report.location?.coordinates ? (
						<>
							<div className="bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
							<MapView
								center={report.location.coordinates}
								zoom={15}
								markers={[{
									id: report._id,
									position: report.location.coordinates,
									title: `${report.type} Waste Report`,
									description: `${report.description}\n\nStatus: ${report.status}\nPriority: ${report.priority}\nVolume: ${report.estimatedVolume} m³`,
									color: '#ef4444' // Red color for waste reports
								}]}
								onMarkerClick={(marker) => {
									console.log('Marker clicked:', marker)
									// You can add additional functionality here, like opening a popup or navigating
								}}
								height="400px"
								interactive={true}
								className="w-full"
							/>
							</div>
							<div className="mt-2 text-center">
								<p className="text-xs text-gray-500">
									Click and drag to explore the area around the report location
								</p>
								<p className="text-xs text-gray-400 mt-1">
									📍 Exact coordinates: {report.location.coordinates.lat.toFixed(6)}, {report.location.coordinates.lng.toFixed(6)}
								</p>
							</div>
						</>
					) : (
						<div className="bg-gray-100 dark:bg-gray-700 rounded-lg h-96 flex items-center justify-center">
							<div className="text-center text-gray-500 dark:text-gray-400">
								<div className="text-4xl mb-2">🗺️</div>
								<p className="text-lg font-medium">Location not available</p>
								<p className="text-sm">This report doesn't have location coordinates</p>
							</div>
						</div>
					)}
				</div>

				{report.images && report.images.length > 0 && (
					<div className="mt-6">
						<h3 className="font-semibold mb-3">Images ({report.images.length})</h3>
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
							{report.images.map((img: string, idx: number) => (
								<img 
									key={idx} 
									src={img} 
									alt={`Report ${idx + 1}`} 
									className="w-full h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
									onClick={() => window.open(img, '_blank')}
								/>
							))}
						</div>
					</div>
				)}
			</div>

			<div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
				<h2 className="font-semibold mb-4">Edit Report (only your reports will be saved)</h2>
				<div className="space-y-4">
					<div>
						<label className="block text-sm font-medium mb-1">Description</label>
						<input 
							value={description} 
							onChange={(e) => setDescription(e.target.value)} 
							placeholder="New description" 
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
						/>
					</div>
					<div>
						<label className="block text-sm font-medium mb-1">Notes</label>
						<textarea 
							value={notes} 
							onChange={(e) => setNotes(e.target.value)} 
							placeholder="Additional notes" 
							rows={3}
							className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white" 
						/>
					</div>
					<div className="flex space-x-3">
						<Button 
							type="button" 
							variant="primary" 
							onClick={() => updateMutation.mutate({ description: description || undefined, notes: notes || undefined })}
							disabled={updateMutation.isPending}
						>
							{updateMutation.isPending ? 'Saving...' : 'Save Changes'}
						</Button>
						<Button 
							type="button" 
							variant="ghost" 
							onClick={() => deleteMutation.mutate()}
							disabled={deleteMutation.isPending}
						>
							{deleteMutation.isPending ? 'Deleting...' : 'Delete Report'}
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default ReportDetail


