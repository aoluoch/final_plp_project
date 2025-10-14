import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { reportsApi } from '../../api/reportsApi'
import Button from '../../components/Button'

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
		<div className="max-w-3xl mx-auto space-y-4">
			<h1 className="text-2xl font-bold">{report.type} report</h1>
			<div className="text-sm text-gray-600">Created: {new Date(report.createdAt).toLocaleString()}</div>
			<p>{report.description}</p>
			<div className="grid grid-cols-2 md:grid-cols-3 gap-2">
				{(report.images || []).map((img: string, idx: number) => (
					<img key={idx} src={img} alt={`Report ${idx}`} className="w-full h-32 object-cover rounded" />
				))}
			</div>
			<div className="space-y-2">
				<h2 className="font-semibold">Edit (only your reports will be saved)</h2>
				<input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="New description" className="w-full px-3 py-2 border rounded" />
				<textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notes" className="w-full px-3 py-2 border rounded" />
				<div className="space-x-2">
					<Button type="button" variant="primary" onClick={() => updateMutation.mutate({ description: description || undefined, notes: notes || undefined })}>Save</Button>
					<Button type="button" variant="ghost" onClick={() => deleteMutation.mutate()}>Delete</Button>
				</div>
			</div>
		</div>
	)
}

export default ReportDetail


