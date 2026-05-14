import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import '../../styles/SearchBar.css';

const SearchBar = () => {
	// State for the current text in the search input
	const [searchTerm, setSearchTerm] = useState('');
	// State for storing categorized results from Firestore (videos/files, classes, users)
	const [results, setResults] = useState({ videos: [], classes: [], users: [] });
	// Controls the visibility of the search result dropdown
	const [isOpen, setIsOpen] = useState(false);
	// Ref to the outer container to help detect clicks outside the search component
	const dropdownRef = useRef(null);

	// Closes the search results dropdown if the user clicks anywhere else on the document
	useEffect(() => {
		const handleClickOutside = (event) => {
		// Close only if the click target is not a child of the search bar container
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsOpen(false);
		}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	// Main search effect that executes when searchTerm changes
	useEffect(() => {
		const performSearch = async () => {
		// Clear results and hide dropdown if search term is less than 2 characters
		if (searchTerm.trim().length < 2) {
			setResults({ videos: [], classes: [], users: [] });
			setIsOpen(false);
			return;
		}

		const term = searchTerm.toLowerCase();

		try {
			// Build queries for public documents across three different collections
			const classQuery = query(collection(db, 'classes'), where('visibility', '==', 'public'), limit(20));
			const userQuery = query(collection(db, 'users'), where('visibility', '==', 'public'), limit(20));
			const fileQuery = query(collection(db, 'files'), where('visibility', '==', 'public'), limit(20));

			// Execute all three Firestore queries in parallel to reduce overall latency
			// Execute all queries in parallel for better performance
			const [classSnap, userSnap, fileSnap] = await Promise.all([
				getDocs(classQuery),
				getDocs(userQuery),
				getDocs(fileQuery)
			]);

			// Map and filter classes matching the search term
			const matchedClasses = classSnap.docs
			.map(doc => ({ id: doc.id, ...doc.data() }))
			.filter(c => c.name.toLowerCase().includes(term));

			// Map and filter users matching the search term based on displayName
			const matchedUsers = userSnap.docs
			.map(doc => ({ id: doc.id, name: doc.data().displayName }))
			.filter(u => u.name?.toLowerCase().includes(term));

			// Map and filter files/videos matching the search term
			const matchedVideos = fileSnap.docs
			.map(doc => ({ id: doc.id, ...doc.data() }))
			.filter(f => f.name.toLowerCase().includes(term));

			// Store processed results and open the dropdown
			setResults({ videos: matchedVideos, classes: matchedClasses, users: matchedUsers });
			setIsOpen(true);
		} catch (error) {
			console.error("Search failed:", error);
		}
		};

		// Debounce the search by 400ms to prevent spamming Firestore on every keystroke
		const timeoutId = setTimeout(performSearch, 400);
		// Cleanup the timeout if the user types again within the 400ms window
		return () => clearTimeout(timeoutId);
	}, [searchTerm]);

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
			onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
		/>
		{isOpen && (
			<div className="search-dropdown">
			{hasResults ? (
				<>
				{/* Render matching Users */}
				{results.users.length > 0 && <div className="search-group-header">Users</div>}
				{results.users.map(u => (
					// Navigation to user profile closes the dropdown
					<Link key={u.id} to={`/profile/${u.id}`} className="search-item user-item" onClick={() => setIsOpen(false)}>
						<div className="search-item-info">
							<span className="search-item-name">{u.name}</span>
						</div>
					</Link>
				))}

				{/* Render matching Classes */}
				{results.classes.length > 0 && <div className="search-group-header">Classes</div>}
				{results.classes.map(c => (
					<Link key={c.id} to={`/class/${c.id}`} className="search-item" onClick={() => setIsOpen(false)}>
						<div className="search-item-info">
							<span className="search-item-name">{c.name}</span>
							<span className="search-item-meta">by {c.ownerName || 'Unknown'}</span>
						</div>
					</Link>
				))}
				
				{/* Render matching Videos & Documents */}
				{results.videos.length > 0 && <div className="search-group-header">Videos & Docs</div>}
				{results.videos.map(v => (
					<a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="search-item video-item" onClick={() => setIsOpen(false)}>
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
