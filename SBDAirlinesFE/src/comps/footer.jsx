import React from 'react';
import { useTheme } from '../themeContext';
import { Link } from 'react-router-dom';

export default function Footer() {
  const { darkMode } = useTheme();
  const footerLinks = [
    {
      title: "Flights",
      links: [
        { name: "Destinations", href: "#" },
        { name: "Schedules", href: "/" },
        { name: "Flight Status", href: "/" },
        { name: "Special Offers", href: "/" }
      ]
    },
    {
      title: "Services",
      links: [
        { name: "Business Class", href: "/" },
        { name: "First Class", href: "/" },
        { name: "Baggage Policy", href: "/" },
        { name: "In-flight Meals", href: "/" }
      ]
    },
    {
      title: "Company",
      links: [
        { name: "About Us", href: "/" },
        { name: "Careers", href: "/" },
        { name: "Privacy Policy", href: "/" },
        { name: "Terms of Service", href: "/" }
      ]
    }
  ];

  return (
    <footer className={`
      w-full py-10 mt-16 transition-all duration-300 
      ${darkMode
        ? "bg-gray-900 border-t border-indigo-500/30"
        : "bg-gray-50 border-t border-indigo-300/30"}
    `}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">          <div>
            <h3 className={`text-2xl font-bold mb-4 flex items-center ${darkMode ? "text-white" : "text-gray-900"}`}>
              <span className="mr-2">✈️</span> SBD Airlines
            </h3>
            <p className={`mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
              Premium air travel experience with comfort and reliability.
            </p>
            <div className="flex space-x-4">
              {[
                {
                  name: "twitter",
                  svg: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z" />
                    </svg>
                  )
                },
                {
                  name: "facebook",
                  svg: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M20 3H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h8.615v-6.96h-2.338v-2.725h2.338v-2c0-2.325 1.42-3.592 3.5-3.592.699-.002 1.399.034 2.095.107v2.42h-1.435c-1.128 0-1.348.538-1.348 1.325v1.735h2.697l-.35 2.725h-2.348V21H20a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1z" />
                    </svg>
                  )
                },
                {
                  name: "instagram",
                  svg: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.254 1.216.598 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.247.637.415 1.363.465 2.428.047 1.066.06 1.405.06 4.122 0 2.717-.01 3.056-.06 4.122-.05 1.065-.218 1.79-.465 2.428a4.883 4.883 0 0 1-1.153 1.772 4.915 4.915 0 0 1-1.772 1.153c-.637.247-1.363.415-2.428.465-1.066.047-1.405.06-4.122.06-2.717 0-3.056-.01-4.122-.06-1.065-.05-1.79-.218-2.428-.465a4.89 4.89 0 0 1-1.772-1.153 4.904 4.904 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.013 15.056 2 14.717 2 12c0-2.717.01-3.056.06-4.122.05-1.066.217-1.79.465-2.428a4.88 4.88 0 0 1 1.153-1.772A4.897 4.897 0 0 1 5.45 2.525c.638-.248 1.362-.415 2.428-.465C8.944 2.013 9.283 2 12 2zm0 1.802c-2.67 0-2.987.01-4.04.059-.977.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.88-.344 1.857-.048 1.053-.059 1.37-.059 4.04 0 2.67.01 2.987.059 4.04.045.977.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.88.3 1.857.344 1.053.048 1.37.059 4.04.059 2.67 0 2.987-.01 4.04-.059.977-.045 1.504-.207 1.857-.344.467-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.88.344-1.857.048-1.053.059-1.37.059-4.04 0-2.67-.01-2.987-.059-4.04-.045-.977-.207-1.504-.344-1.857a3.097 3.097 0 0 0-.748-1.15 3.098 3.098 0 0 0-1.15-.748c-.353-.137-.88-.3-1.857-.344-1.053-.048-1.37-.059-4.04-.059zm0 3.064A5.135 5.135 0 0 1 17.135 12 5.135 5.135 0 0 1 12 17.135 5.135 5.135 0 0 1 6.865 12 5.135 5.135 0 0 1 12 6.865zm0 1.802A3.333 3.333 0 1 0 15.333 12 3.333 3.333 0 0 0 12 8.667zm6.538-3.205a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
                    </svg>
                  )
                },
                {
                  name: "github",
                  svg: (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  )
                }
              ].map(platform => (
                <a
                  key={platform.name}
                  href={`https://www.${platform.name}.com`}
                  className={`
                w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300
                ${darkMode
                      ? "bg-gray-800 text-gray-300 hover:bg-indigo-600 hover:text-white"
                      : "bg-gray-200 text-gray-600 hover:bg-indigo-500 hover:text-white"}
              `}
                  aria-label={`Visit our ${platform.name} page`}
                >
                  {platform.svg}
                </a>
              ))}
            </div>
          </div>

          {footerLinks.map((section, index) => (
            <div key={index}>
              <h4 className={`text-lg font-semibold mb-4 ${darkMode ? "text-white" : "text-gray-900"}`}>
                {section.title}
              </h4>
              <ul className="space-y-2">
                {section.links.map((link, i) => (
                  <li key={i}>
                    <Link to={link.href} className={`
                      transition-colors duration-300
                      ${darkMode
                        ? "text-gray-400 hover:text-indigo-400"
                        : "text-gray-600 hover:text-indigo-600"}
                    `}>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className={`pt-8 mt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 
          ${darkMode ? "border-gray-800 text-gray-400" : "border-gray-200 text-gray-600"}`}>          <p className="text-sm">
            &copy; 2025 SBD Airlines. All rights reserved.
          </p>
          <div className="flex space-x-6 text-sm">
            <Link to="/" className={`hover:${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
              Privacy
            </Link>
            <Link to="/" className={`hover:${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
              Terms
            </Link>
            <Link to="/" className={`hover:${darkMode ? "text-indigo-400" : "text-indigo-600"}`}>
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}