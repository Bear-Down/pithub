import React, { useState } from 'react';
import '../../styles/Info.css';

// Import team member images from src/assets/members/
import edwardImg from '../../assets/members/edward-800-by-800.jpg';
import erickImg from '../../assets/members/erick-800-by-800.jpg';
import kalebImg from '../../assets/members/kaleb-800-by-800.jpg';
import kevinImg from '../../assets/members/kevin-800-by-800.jpg';
import sebastianImg from '../../assets/members/sebastian-800-by-800.jpg';

// Do NOTTTT remove any members added below unless they were not part of the team to begin with!!!
const teamGroups = [
    {
        teamName: 'Bear Down (Founders)',
        members: [
            {
                name: 'Kevin Dacanay',
                role: 'Founding Developer',
                email: 'kevinbrianfdacanay@lewisu.edu',
                image: kevinImg
            },
            {
                name: 'Sebastian Jaculbe',
                role: 'Founding Developer',
                email: 'sebastiandjaculbe@lewisu.edu',
                image: sebastianImg
            },
            {
                name: 'Erick Hernandez',
                role: 'Founding Developer',
                email: 'erickrdhernandez@lewisu.edu',
                image: erickImg
            },
            {
                name: 'Kaleb Richardson',
                role: 'Founding Developer',
                email: 'kalebrjrichardson@lewisu.edu',
                image: kalebImg
            },
            {
                name: 'Edward Rodriguez',
                role: 'Founding Developer',
                email: 'edwardhrodriguez@lewisu.edu',
                image: edwardImg
            }
        ]
    }

    // New members!!! Add your info here!!! Also add your pictures from your GettingToKnowEachOtherTeam project 
    // from Software Engineering class to the src/assets/members/ folder!!!
    // Example:
    // {
    //     teamName: 'Your Scrum Team Name',
    //     members: [ 
    //     {
    //        name:..., role:..., email:..., image:....
    //     } 
    //     ]
    // }
];

const faqItems = [
    {
        question: 'How do I create an account on PitHub?',
        answer: 'Logging in with your Lewis University email address automatically creates an account. No extra registration form is required!'
    },
    {
        question: 'Who can upload instructional content to PitHub?',
        answer: 'Lewis University faculty, staff, and authorized students can create classes and view/upload video or document files.'
    },
    {
        question: 'What file formats are supported for document and video uploads?',
        answer: 'PitHub supports common video formats (MP4, WEBM, MOV) and document formats (PDF, DOCX, PPTX).'
    },
    {
        question: 'How can I report a bug or request support?',
        answer: 'You can email our developers directly or send a message through the Support Message section below. Support requests are typically processed within 1 business day between 6:00 AM and 11:00 PM.'
    }
    // New FAQs add here!!!
];

const Contact = () => {
    const [openFaqIndex, setOpenFaqIndex] = useState(null);

    const toggleFaq = (index) => {
        setOpenFaqIndex(prevIndex => prevIndex === index ? null : index);
    };

    return (
        <div className="container">
            <h1>Contact Us & Support</h1>
            <p className="contact-subtitle">
                Have questions, feedback, or need assistance with PitHub? Reach out to our team or consult our FAQ below.
            </p>

            {/* Support Info Panel */}
            <section className="support-card">
                <div className="support-header">
                    <h3>Developer Support & Technical Help</h3>
                </div>
                <p>
                    For technical support, feature requests, or platform inquiries, please reach out to our primary developer contact.
                </p>
                <div className="support-details-grid">
                    <div className="support-detail-item">
                        <span className="support-label">Developer Contact</span>
                        <span className="support-value">
                            <span className="support-value">Listed below</span>
                        </span>
                    </div>
                    <div className="support-detail-item">
                        <span className="support-label">Support Hours</span>
                        <span className="support-value">6:00 AM – 11:00 PM</span>
                    </div>
                    <div className="support-detail-item">
                        <span className="support-label">Response Time</span>
                        <span className="support-value">Within 1 business day</span>
                    </div>
                </div>
            </section>

            {/* Development Teams Section */}
            <h2>Our Development Team</h2>
            {teamGroups.map((group, groupIdx) => (
                <div className="team-group-section" key={groupIdx}>
                    <h3 className="team-group-title">{group.teamName}</h3>
                    <div className="members-grid">
                        {group.members.map((member, memberIdx) => (
                            <div className="member-card" key={memberIdx}>
                                <div className="member-img-wrapper">
                                    <img src={member.image} alt={member.name} className="member-img" />
                                </div>
                                <h3 className="member-name">{member.name}</h3>
                                <span className="member-role">{member.role}</span>
                                <a href={`mailto:${member.email}`} className="member-email">{member.email}</a>
                            </div>
                        ))}
                    </div>
                </div>
            ))}

            {/* Interactive Accordion FAQ */}
            <h2>Frequently Asked Questions (FAQ)</h2>
            <div className="faq-list">
                {faqItems.map((item, index) => {
                    const isOpen = openFaqIndex === index;
                    return (
                        <div className={`faq-item ${isOpen ? 'open' : ''}`} key={index}>
                            <button className="faq-question-btn" onClick={() => toggleFaq(index)}>
                                <span>{item.question}</span>
                            </button>
                            {isOpen && (
                                <div className="faq-answer-panel">
                                    <p>{item.answer}</p>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Implement Next Sprint!!! Direct Support Contact Form */}
            <h2>Direct Support Message</h2>
            <div className="contact-form-placeholder">
                <span className="form-placeholder-badge">Work In Progresss</span>
                <h3>Send a Message Directly to Admins</h3>
                <div className="form-placeholder-fields">
                    <input type="text" className="placeholder-input" placeholder="Subject / Topic" disabled />
                    <textarea className="placeholder-input" rows="3" placeholder="Describe your issue or question..." disabled></textarea>
                    <button className="placeholder-btn" disabled>Send Message</button>
                </div>
            </div>

            {/* Add Notification Pop Ups for submition success */}
            <p className="last-updated">
                Last Updated: September 20, 2026
            </p>
        </div>
    );
};

export default Contact;