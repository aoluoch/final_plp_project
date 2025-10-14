import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { reportsApi } from '../../api/reportsApi'
import Button from '../../components/Button'

const Feed: React.FC = () => {
	const qc = useQueryClient()
	const { data: reports = [], isLoading } = useQuery({ queryKey: ['reports','feed'], queryFn: reportsApi.getFeed })
	const deleteMutation = useMutation({
		mutationFn: (id: string) => reportsApi.delete(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['reports','feed'] })
	})

	if (isLoading) return <div>Loading feed...</div>

	return (
		<div className="max-w-5xl mx-auto space-y-4">
			<h1 className="text-2xl font-bold">Community Waste Reports</h1>
			<div className="grid gap-4">
				{reports.map((r: any) => (
					<div key={r._id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
						<div className="flex items-center justify-between">
							<Link to={`/reports/${r._id}`} className="text-lg font-semibold hover:underline">
								{r.type} • {new Date(r.createdAt).toLocaleString()}
							</Link>
							<div className="space-x-2">
								<Link to={`/reports/${r._id}`}>
									<Button type="button" variant="outline">View</Button>
								</Link>
								{/* Delete allowed server-side for owners; other users will be rejected */}
								<Button type="button" variant="ghost" onClick={() => deleteMutation.mutate(r._id)}>Delete</Button>
							</div>
						</div>
						<p className="text-sm mt-2">{r.description}</p>
					</div>
				))}
			</div>
		</div>
	)
}

export default Feed


