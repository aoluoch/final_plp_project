import React from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { reportsApi } from '../../api/reportsApi'
import Button from '../../components/Button'

interface ReportFeedItem {
  _id: string
  type: string
  description: string
  createdAt: string
}

const Feed: React.FC = () => {
	const qc = useQueryClient()
	const { data: reports = [], isLoading, error } = useQuery({ 
		queryKey: ['reports','feed'], 
		queryFn: async () => {
			console.log('Fetching reports feed...')
			try {
				const result = await reportsApi.getFeed()
				console.log('Feed result:', result)
				return result
			} catch (err) {
				console.error('Feed API error:', err)
				throw err
			}
		}
	})
	const deleteMutation = useMutation({
		mutationFn: (id: string) => reportsApi.delete(id),
		onSuccess: () => qc.invalidateQueries({ queryKey: ['reports','feed'] })
	})

	if (isLoading) return <div>Loading feed...</div>
	
	if (error) {
		console.error('Feed error:', error)
		return <div>Error loading feed: {error.message}</div>
	}

	return (
		<div className="max-w-5xl mx-auto space-y-4">
			<h1 className="text-2xl font-bold">Community Waste Reports</h1>
			{reports.length === 0 ? (
				<div className="text-center py-8">
					<p className="text-gray-500">No reports found. Be the first to report waste in your community!</p>
				</div>
			) : (
				<div className="grid gap-4">
					{reports.map((r: ReportFeedItem) => (
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
			)}
		</div>
	)
}

export default Feed


