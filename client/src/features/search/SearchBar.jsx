import React from 'react';
import { Link } from 'react-router-dom';
import { useSearchBar } from '../../hooks/useSearchBar';
import '../../styles/SearchBar.css';

const SearchBar = () => {
	const {
		searchTerm,
		setSearchTerm,
		results,
		isOpen,
		dropdownRef,
		handleInputFocus,
		closeDropdown
	} = useSearchBar();

	const hasResults = results.videos.length > 0 || results.classes.length > 0 || results.users.length > 0;

	return (
		<div className="search-container" ref={dropdownRef}>
		<input
			type="text"
			className="search-input"
			placeholder="Search PitHub..."
			value={searchTerm}
			onChange={(e) => setSearchTerm(e.target.value)}
			// Re-open dropdown on focus if criteria are met
			onFocus={handleInputFocus}
		/>
		{isOpen && (
			<div className="search-dropdown">
			{hasResults ? (
				<>
				{/* Render matching Users */}
				{results.users.length > 0 && <div className="search-group-header">Users</div>}
				{results.users.map(u => (
					// Navigation to user profile closes the dropdown
					<Link key={u.id} to={`/profile/${u.id}`} className="search-item user-item" onClick={closeDropdown}>
						<div className="search-item-info">
							<span className="search-item-name">{u.name}</span>
						</div>
					</Link>
				))}

				{/* Render matching Classes */}
				{results.classes.length > 0 && <div className="search-group-header">Classes</div>}
				{results.classes.map(c => (
					<Link key={c.id} to={`/class/${c.id}`} className="search-item" onClick={closeDropdown}>
						<div className="search-item-info">
							<span className="search-item-name">{c.name}</span>
							<span className="search-item-meta">by {c.ownerName || 'Unknown'}</span>
						</div>
					</Link>
				))}
				
				{/* Render matching Videos & Documents */}
				{results.videos.length > 0 && <div className="search-group-header">Videos & Docs</div>}
				{results.videos.map(v => (
					<a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="search-item video-item" onClick={closeDropdown}>
						{v.thumbnailUrl ? (
							<img src={v.thumbnailUrl} alt="" className="search-item-thumb" />
						) : (
							// Show appropriate icon if no thumbnail exists
							<div className="search-item-thumb-placeholder">{v.type?.includes('video') ? '🎬' : '📄'}</div>
						)}
						<div className="search-item-info">
							<span className="search-item-name">{v.name}</span>
							<span className="search-item-meta">by {v.ownerName || 'Unknown'}</span>
						</div>
					</a>
				))}
				</>
			) : (
				// Feedback when no matches are found in Firestore
				<div className="search-no-results">No public matches found</div>
			)}
			</div>
		)}
		</div>
	);
};
export default SearchBar;
