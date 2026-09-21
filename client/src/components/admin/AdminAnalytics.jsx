import React, { useMemo, useState } from 'react';
import { useAdminAnalytics } from '../../hooks/admin/useAdminAnalytics';

const CHARTS = {
	uploads: { label: 'Upload Trends', type: 'line', dataKey: 'uploadsByDay' },
	types: { label: 'Document Types', type: 'bar', dataKey: 'documentsByType' },
	visibility: { label: 'Visibility Distribution', type: 'pie', dataKey: 'visibility' },
	classes: { label: 'Documents by Class', type: 'bar', dataKey: 'documentsByClass' },
	reportStatus: { label: 'Report Status', type: 'pie', dataKey: 'reportsByStatus' },
	reportReasons: { label: 'Report Reasons', type: 'bar', dataKey: 'reportsByReason' },
};

const formatNumber = (value) => new Intl.NumberFormat().format(Math.round(value));
const formatDecimal = (value) => Number(value).toFixed(1);

function MetricCard({ label, value, detail }) {
	return (
		<div className="stat-card analytics-stat-card">
			<span className="stat-label">{label}</span>
			<strong className="stat-value">{value}</strong>
			{detail && <span className="analytics-stat-detail">{detail}</span>}
		</div>
	);
}

function BarChart({ data, horizontal = false }) {
	if (!data.length) return <div className="analytics-empty">No data available.</div>;
	const max = Math.max(...data.map((item) => item.value), 1);

	return (
		<div className={horizontal ? 'analytics-horizontal-bars' : 'analytics-bar-chart'}>
			{data.slice(0, horizontal ? 10 : 12).map((item) => (
				<div className={horizontal ? 'analytics-horizontal-row' : 'analytics-bar-column'} key={item.label}>
					{horizontal ? (
						<>
							<div className="analytics-horizontal-label" title={item.label}>{item.label}</div>
							<div className="analytics-horizontal-track"><span style={{ width: `${(item.value / max) * 100}%` }} /></div>
							<div className="analytics-horizontal-value">{formatNumber(item.value)}</div>
						</>
					) : (
						<>
							<div className="analytics-bar-value">{formatNumber(item.value)}</div>
							<div className="analytics-bar-track"><span style={{ height: `${(item.value / max) * 100}%` }} /></div>
							<div className="analytics-bar-label" title={item.label}>{item.label}</div>
						</>
					)}
				</div>
			))}
		</div>
	);
}

function PieChart({ data }) {
	const total = data.reduce((sum, item) => sum + item.value, 0);
	if (!total) return <div className="analytics-empty">No data available.</div>;

	let offset = 0;
	const segments = data.map((item, index) => {
		const start = offset;
		offset += (item.value / total) * 360;
		return `${index % 2 === 0 ? 'var(--admin-brand-color)' : 'var(--admin-link-color)'} ${start}deg ${offset}deg`;
	});

	return (
		<div className="analytics-pie-layout">
			<div className="analytics-pie" style={{ background: `conic-gradient(${segments.join(', ')})` }} />
			<div className="analytics-legend">
				{data.map((item, index) => (
					<div className="analytics-legend-item" key={item.label}>
						<span className="analytics-legend-dot" style={{ background: index % 2 === 0 ? 'var(--admin-brand-color)' : 'var(--admin-link-color)' }} />
						<span>{item.label}</span>
						<strong>{formatNumber(item.value)} ({((item.value / total) * 100).toFixed(1)}%)</strong>
					</div>
				))}
			</div>
		</div>
	);
}

function ChartPanel({ chartKey, analytics }) {
	const chart = CHARTS[chartKey];
	const data = analytics[chart.dataKey] || [];

	return (
		<div className="analytics-card analytics-chart-card">
			<div className="analytics-card-header">
				<div>
					<span className="stat-label">Selected Visualization</span>
					<h3>{chart.label}</h3>
				</div>
				<span className="admin-badge">{chart.type}</span>
			</div>
			{chart.type === 'pie' ? <PieChart data={data} /> : <BarChart data={data} horizontal={chartKey === 'classes' || chartKey === 'reportReasons'} />}
		</div>
	);
}

export default function AdminAnalytics() {
	const { analytics, loading, error, refreshAnalytics } = useAdminAnalytics();
	const [selectedChart, setSelectedChart] = useState('uploads');
	const [timeRange, setTimeRange] = useState('all');

	const uploadData = useMemo(() => {
		if (!analytics) return [];
		if (timeRange === 'all') return analytics.uploadsByDay;
		const days = Number(timeRange);
		return analytics.uploadsByDay.slice(-days);
	}, [analytics, timeRange]);

	if (loading && !analytics) return <div className="admin-loading-spinner">Loading analytics...</div>;
	if (error && !analytics) return <div className="analytics-error">{error}</div>;
	if (!analytics) return null;

	const chartAnalytics = { ...analytics, uploadsByDay: uploadData };

	return (
		<div className="admin-analytics">
			<div className="analytics-toolbar">
				<div>
					<span className="stat-label">Reports / Analytics</span>
					<h2>Platform Insights</h2>
					<p>Monitor document activity, engagement, distribution, and reporting activity.</p>
				</div>
				<div className="analytics-controls">
					<label>
						<span>Chart</span>
						<select className="admin-select" value={selectedChart} onChange={(event) => setSelectedChart(event.target.value)}>
							{Object.entries(CHARTS).map(([key, chart]) => <option key={key} value={key}>{chart.label}</option>)}
						</select>
					</label>
					<label>
						<span>Range</span>
						<select className="admin-select" value={timeRange} onChange={(event) => setTimeRange(event.target.value)}>
							<option value="7">Last 7 Days</option>
							<option value="30">Last 30 Days</option>
							<option value="90">Last 90 Days</option>
							<option value="all">All Time</option>
						</select>
					</label>
					<button type="button" className="admin-action-btn" onClick={refreshAnalytics}>Refresh</button>
				</div>
			</div>

			<div className="stats-grid analytics-stats-grid">
				<MetricCard label="Total Documents" value={formatNumber(analytics.totalFiles)} />
				<MetricCard label="Total Views" value={formatNumber(analytics.totalViews)} />
				<MetricCard label="Avg Views / Document" value={formatDecimal(analytics.averageViews)} />
				<MetricCard label="Public Documents" value={formatNumber(analytics.publicFiles)} detail={`${formatDecimal(analytics.totalFiles ? (analytics.publicFiles / analytics.totalFiles) * 100 : 0)}% of library`} />
			</div>

			<div className="analytics-section-heading"><span>Content Analytics</span></div>
			<ChartPanel chartKey={selectedChart} analytics={chartAnalytics} />

			<div className="analytics-quick-grid">
				<div className="analytics-card">
					<div className="analytics-card-header"><h3>Engagement</h3><span className="admin-badge">Live totals</span></div>
					<div className="analytics-mini-stats">
						<div><span>Total Views</span><strong>{formatNumber(analytics.totalViews)}</strong></div>
						<div><span>Avg / Document</span><strong>{formatDecimal(analytics.averageViews)}</strong></div>
					</div>
				</div>
				<div className="analytics-card">
					<div className="analytics-card-header"><h3>Report Health</h3><span className="admin-badge admin-badge-warning">Moderation</span></div>
					<div className="analytics-mini-stats">
						<div><span>Total Reports</span><strong>{formatNumber(analytics.totalReports)}</strong></div>
						<div><span>Pending</span><strong>{formatNumber(analytics.pendingReports)}</strong></div>
						<div><span>Resolved</span><strong>{formatNumber(analytics.resolvedReports)}</strong></div>
						<div><span>Reported Docs</span><strong>{formatNumber(analytics.reportedDocuments)}</strong></div>
					</div>
				</div>
			</div>

			<div className="analytics-section-heading"><span>Top Content</span></div>
			<div className="analytics-card analytics-table-card">
				<div className="analytics-card-header"><h3>Most Viewed Documents</h3></div>
				<div className="admin-table-container analytics-inner-table">
					<table className="admin-table">
						<thead><tr><th>Document</th><th>Class</th><th>Views</th></tr></thead>
						<tbody>{analytics.mostViewed.map((file) => <tr key={file.id}><td>{file.name}</td><td>{file.className}</td><td><span className="admin-badge">{formatNumber(file.views)}</span></td></tr>)}</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
