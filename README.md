# Uganda Schools Rugby Association (USRA) Website

A modern, responsive website for the Uganda Schools Rugby Association that serves as a landing page and registration platform for schools and players.

## 🏉 Features

### Core Features
- **Hero Section**: Eye-catching landing area with gradient overlay and call-to-action buttons
- **About Section**: Information about USRA's mission, vision, and key features
- **Chairman's Message**: Personal message from the association chairman
- **Statistics Section**: Animated counters showing USRA's impact
- **Registration System**: School registration form for joining the association
- **Contact Section**: Contact information and inquiry form
- **Responsive Design**: Mobile-first approach for all devices

### Technical Features
- **Smooth Scroll Animations**: AOS (Animate On Scroll) library integration
- **Interactive Elements**: Hover effects, transitions, and micro-interactions
- **Form Handling**: Client-side form validation and submission
- **Counter Animations**: Animated statistics that count up when scrolled into view
- **Mobile Navigation**: Hamburger menu for mobile devices
- **Parallax Effects**: Subtle parallax scrolling on hero section
- **Notification System**: Success/error notifications for form submissions

## 🎨 Design

### Color Scheme
- **Primary Red**: #FF0000 (Uganda flag red)
- **Secondary Yellow**: #FFD700 (Uganda flag yellow)
- **Supporting Colors**: Various shades of gray and white for contrast

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800
- **Responsive**: Scales appropriately across all devices

## 📁 Project Structure

```
newUSRA/
├── index.html          # Main HTML file
├── styles.css          # CSS styles and animations
├── script.js           # JavaScript functionality
└── README.md           # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional, for development)

### Installation

1. **Clone or Download** the project files
2. **Open** `index.html` in your web browser
3. **Or** serve the files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js (if you have http-server installed)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

### Supabase Setup

1. Create a project at `https://app.supabase.com`
2. In the SQL editor, run the contents of `schema.sql`
3. Go to Settings → API and copy:
   - Project URL
   - anon public key
4. In `index.html`, before production, define ENV variables if desired:
   ```html
   <script>
     window.ENV_SUPABASE_URL = 'https://YOUR_PROJECT_ID.supabase.co';
     window.ENV_SUPABASE_ANON_KEY = 'YOUR_PUBLIC_ANON_KEY';
   </script>
   ```
5. Or edit `supabaseClient.js` to paste the URL and anon key.
6. Open the site and use the Admin Sign In box under Registration to create an account and sign in. After signing in, you can submit the School Registration form; submissions will be stored in the `schools` table. Contact messages go to the `contacts` table.

### Development

To modify the website:

1. **Edit HTML**: Modify `index.html` for structure changes
2. **Edit CSS**: Modify `styles.css` for styling changes
3. **Edit JavaScript**: Modify `script.js` for functionality changes

## 📱 Responsive Design

The website is fully responsive and optimized for:
- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px - 1199px (adjusted grid layouts)
- **Mobile**: < 768px (stacked layout, mobile navigation)

## 🔧 Customization

### Colors
Update the CSS custom properties in `styles.css`:
```css
:root {
    --primary-red: #FF0000;
    --secondary-yellow: #FFD700;
    /* ... other colors */
}
```

### Content
- **Images**: Replace placeholder images with actual USRA photos
- **Text**: Update content in `index.html` to match your organization
- **Contact Info**: Update contact details in the contact section
- **Statistics**: Modify counter values in the statistics section

### Forms
The registration and contact forms are currently set up for demonstration. To make them functional:

1. **Backend Integration**: Connect to your preferred backend service
2. **Email Service**: Integrate with services like EmailJS, Formspree, or custom backend
3. **Database**: Store registrations in your preferred database

## 🌐 Browser Support

- **Chrome**: 60+
- **Firefox**: 55+
- **Safari**: 12+
- **Edge**: 79+

## 📞 Contact Information

For questions about the website or USRA:
- **Email**: info@usra.ug
- **Phone**: +256 123 456 789
- **Address**: Plot 123, Kampala Road, Kampala, Uganda

## 📄 License

This project is created for the Uganda Schools Rugby Association. All rights reserved.

## 🤝 Contributing

To contribute to this project:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Known Issues

- None currently reported

## 🔮 Future Enhancements

Potential future features:
- **Admin Dashboard**: For managing registrations and content
- **Event Calendar**: For tournaments and events
- **Photo Gallery**: Showcase rugby events and teams
- **News/Blog**: Latest updates and announcements
- **Player Profiles**: Individual player registration and profiles
- **Tournament Results**: Live scores and results
- **Social Media Integration**: Direct social media feeds

---

**Built with ❤️ for the Uganda Schools Rugby Association**
