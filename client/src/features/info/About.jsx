import React from 'react';
import '../../styles/About.css';

const About = () => {
	return (
		<div className="container">
		<h1>About PitHub</h1>
		<p>
			PitHub is a university-focused video sharing platform designed to help students and professors
			organize, share, and access academic content efficiently.
		</p>

		<h2>Our Purpose</h2>
		<p>
			The goal of PitHub is to create a centralized space where course-related content such as lectures,
			presentations, and study materials, can be easily uploaded, categorized, and accessed.
		</p>

		<h2>How It Works</h2>
		<p>
			Users can create class-based folders where they upload and manage videos. Each class contains
			structured information such as course name, professor, and relevant materials.
		</p>

		<h2>Key Features</h2>
		<p>
			- Upload and manage video content<br />
			- Organize videos by classes<br />
			- Public and private visibility settings<br />
			- Profile system with starred content<br />
			- Search functionality for users, classes, and videos
		</p>

		<h2>Future Development</h2>
		<p>
			Future updates may include document sharing, collaborative study groups, and enhanced interaction
			features between users.
		</p>

		<h2>Meet Our Team</h2>
		<p>
			This application was created by the{' '}
			<a
			href="https://nice-bay-0f6a7851e.4.azurestaticapps.net/"
			target="_blank"
			rel="noopener noreferrer"
			>
			Bear Down
			</a>{' '}
			Scrum Team for CPSC44000 Software Engineering course. Thank you for using our app!
		</p>
		</div>
	);
};

export default About;