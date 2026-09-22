import React from 'react';
import { Link  } from 'react-router-dom'
import '../../styles/Info.css';
import Contact from './Contact'

const About = () => {
	return (
		<div className="container">
			<h1>About PitHub</h1>
			<p>
				PitHub is a Centralized Academic Resource Hub for Lewis University, designed to make 
				instructional content easier to organize, access, and share. Our platform provides a 
				centralized environment where university faculty, staff, as well as students can manage
				educational videos and documents in one place.
			</p>

			<h2>What PitHub Does</h2>
			<p>
				PitHub is a university-focused media-sharing platform created
				to support the distribution and organization of instructional
				resources within the Lewis University community. Instead of
				relying on scattered file locations, disconnected links, or
				informal methods of sharing course materials, PitHub provides
				a structured environment for managing academic content.
			</p>
			<p>
				Faculty and staff can organize instructional videos and
				documents into class-based collections. Each class can include
				relevant information such as the course name, professor,
				description, and associated learning materials. This structure
				helps users locate resources according to their academic
				context rather than searching through unrelated files.
			</p>

			<p>
				PitHub is intended to support the sharing of educational
				material while keeping content organized, accessible, and
				subject to appropriate visibility and access settings.
			</p>

			<h2>Key Features</h2>
			<p>
				PitHub organizes instructional resources around classes and
				academic collections. Users can associate videos and documents
				with specific classes, making it easier to maintain a logical
				connection between a resource and the course or subject it
				supports.
			</p>
			<ul>
				<h3>Instructional Video Sharing</h3>
				<p>
					Users can upload, manage, and view instructional videos through
					the platform. Video information can include titles, descriptions,
					visibility settings, thumbnails, and other metadata that help
					users understand the purpose of each resource before opening it.
				</p>
				<h3>Document Management</h3>
				<p>
					PitHub supports the organization and sharing of academic
					documents alongside video content. Documents can be associated
					with classes so that instructional materials remain connected
					to the appropriate course context.
				</p>
				<h3>Content Visibility and Sharing</h3>
				<p>
					PitHub provides visibility controls that allow users to manage
					how their instructional materials are shared. These controls
					are intended to help content owners determine whether a
					resource should be broadly accessible or restricted to a
					specific audience.
				</p>
				<h3>Search and Content Discovery</h3>
				<p>
					The platform helps users locate existing academic resources
					through searchable profiles, classes, videos, and documents.
					Search and filtering tools are intended to reduce the time
					required to find relevant instructional content.
				</p>
				<h3>User Profiles and Personalized Access</h3>
				<p>
					PitHub includes user profiles that provide context about the
					people contributing to the platform. Users can also organize
					access to resources and profiles they find useful through
					available bookmarking or starring functionality.
				</p>
			</ul>

			<h2>Technology Behind PitHub</h2>
			<p>
				PitHub is built using a modern web application architecture
				designed to support maintainability, scalability, and
				collaboration during development.
			</p>
			<ul>
				<h3>React</h3>
				<p>
					React is used to build the frontend interface. It allows the
					application to be organized into reusable components and
					interactive pages, including class pages, profile pages,
					resource views, administrative interfaces, and account-related
					screens.
				</p>
				<h3>Firebase</h3>
				<p>
					Firebase provides services used to support PitHub's data,
					authentication, and file-management requirements. Firebase
					services help the application manage user information,
					academic resources, uploaded files, and access permissions.
				</p>
				<h3>GitHub</h3>
				<p>
					GitHub is used for source-code management, issue tracking,
					documentation, collaboration, and reviewing changes. It
					allows the development team to coordinate work and maintain
					a shared record of the project's progress.
				</p>
			</ul>	

			<h2>How PitHub Works</h2>

			<ul>
				<h3>1. Login using Lewis University Gmail Account</h3>
				<p>
					A faculty or staff member signs in using the supported
					university authentication process. After signing in, the
					user can access the portions of PitHub permitted by their
					account and the platform's access rules.
				</p>
				<h3>2. Create or Access a Class</h3>
				<p>
					Users can create a class or open an existing one. Class information 
					provides context for the instructional resources that will be stored 
					and shared within it.
				</p>
				<h3>3. Upload Your Files and Resources Within A Class</h3>
				<p>
					Users can upload videos and documents and associate them with
					the appropriate class. Resource information and visibility
					settings can be configured to make the content easier to
					identify and share.
				</p>
				<h3>4. Locate and View Content</h3>
				<p>
					Other authorized users can browse classes, search for resources,
					open instructional materials, and access content according to
					the permissions established by the content owner and the
					platform.
				</p>
				<h3>5. Maintain, Manage, or Share Your Files</h3>
				<p>
					Content owners can update relevant resource information,
					adjust available sharing settings, or remove content when
					it is no longer needed. This helps keep class collections
					accurate and useful over time.
				</p>
			</ul>
			<h2>Built for the Lewis University Community</h2>

			<p>
				PitHub is originally developed by CPSC49200 Software Engineering 
				Capstone's <a href="https://nice-bay-0f6a7851e.4.azurestaticapps.net/" target="_blank">Bear Down</a> Scrum Team. 
				The project is continually developed by the teams recruited by Bear Down listed <Link to="/contact">here</Link>.
				Current and future developments of PitHub focuses on applying software engineering practices to the
				development of a practical university-based platform.
			</p>
			<p>
				By organizing instructional media around classes and academic
				resources, PitHub aims to provide a more structured way for
				members of the university community to share and access
				educational material.
			</p>

			<p>
				PitHub is an evolving project, continuously being worked on by our team members. 
				Its functionality and workflows may change as the development team evaluates feedback,
				improves existing features, and continues refining the platform's usefulness for 
				university faculty, staff, and students.
			</p>

			<p className="last-updated">
				Last Updated: September 19, 2026
			</p>
		</div>
	);
};

export default About;