import { useState, useEffect, useRef } from 'react';
import { db } from '../lib/firebase';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

export const useSearchBar = () => {
	const navigate = useNavigate();
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
			// Special case: Redirect to admin login if exactly '/admin' is typed
			if (searchTerm.trim() === '/admin') {
				setSearchTerm('');
				setIsOpen(false);
				navigate('/admin/login');
				return;
			}

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
	}, [searchTerm, navigate]);

	const handleInputFocus = () => {
		if (searchTerm.length >= 2) {
			setIsOpen(true);
		}
	};

	const closeDropdown = () => setIsOpen(false);

	return {
		searchTerm,
		setSearchTerm,
		results,
		isOpen,
		dropdownRef,
		handleInputFocus,
		closeDropdown
	};
};