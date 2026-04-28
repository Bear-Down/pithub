import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import '../../styles/SearchBar.css';

const SearchBar = () => {
	const [searchTerm, setSearchTerm] = useState('');
	const [results, setResults] = useState({ videos: [], classes: [], users: [] });
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
		if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
			setIsOpen(false);
		}
		};
		document.addEventListener('mousedown', handleClickOutside);
		return () => document.removeEventListener('mousedown', handleClickOutside);
	}, []);

	useEffect(() => {
		const performSearch = async () => {
		if (searchTerm.trim().length < 2) {
			setResults({ videos: [], classes: [], users: [] });
			setIsOpen(false);
			return;
		}

		const term = searchTerm.toLowerCase();

		try {
			// 1. Search Public Classes
			const classQuery = query(collection(db, 'classes'), where('visibility', '==', 'public'), limit(10));
			const classSnap = await getDocs(classQuery);
			const matchedClasses = classSnap.docs
			.map(doc => ({ id: doc.id, name: doc.data().name }))
			.filter(c => c.name.toLowerCase().includes(term));

			// 2. Search Public Users
			const userQuery = query(collection(db, 'users'), where('visibility', '==', 'public'), limit(10));
			const userSnap = await getDocs(userQuery);
			const matchedUsers = userSnap.docs
			.map(doc => ({ id: doc.id, name: doc.data().displayName }))
			.filter(u => u.name?.toLowerCase().includes(term));

			// 3. Search Public Videos (Files)
			const fileQuery = query(collection(db, 'files'), where('visibility', '==', 'public'), limit(10));
			const fileSnap = await getDocs(fileQuery);
			const matchedVideos = fileSnap.docs
			.map(doc => ({ id: doc.id, name: doc.data().name, url: doc.data().url }))
			.filter(f => f.name.toLowerCase().includes(term));

			setResults({ videos: matchedVideos, classes: matchedClasses, users: matchedUsers });
			setIsOpen(true);
		} catch (error) {
			console.error("Search failed:", error);
		}
		};

		const timeoutId = setTimeout(performSearch, 400);
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
			onFocus={() => searchTerm.length >= 2 && setIsOpen(true)}
		/>
		{isOpen && (
			<div className="search-dropdown">
			{hasResults ? (
				<>
				{results.classes.length > 0 && <div className="search-group-header">Classes</div>}
				{results.classes.map(c => (
					<Link key={c.id} to={`/class/${c.id}`} className="search-item" onClick={() => setIsOpen(false)}>{c.name}</Link>
				))}
				
				{results.users.length > 0 && <div className="search-group-header">Users</div>}
				{results.users.map(u => (
					<Link key={u.id} to={`/profile/${u.id}`} className="search-item" onClick={() => setIsOpen(false)}>{u.name}</Link>
				))}

				{results.videos.length > 0 && <div className="search-group-header">Videos</div>}
				{results.videos.map(v => (
					<a key={v.id} href={v.url} target="_blank" rel="noreferrer" className="search-item" onClick={() => setIsOpen(false)}>{v.name}</a>
				))}
				</>
			) : (
				<div className="search-no-results">No public matches found</div>
			)}
			</div>
		)}
		</div>
	);
};
export default SearchBar;
