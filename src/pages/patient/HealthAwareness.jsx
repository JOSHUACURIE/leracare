// src/pages/patient/HealthAwareness.jsx
import { useState, useEffect } from 'react';
import Navbar from '../../components/layout/Navbar';
import Sidebar from '../../components/layout/Sidebar';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import API from '../../services/api';
import './HealthAwareness.css';

export default function HealthAwareness() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: 'all',
    search: ''
  });
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Mock health articles (in a real app, these would come from your API)
  const mockArticles = [
    {
      id: 1,
      title: "Managing Diabetes: A Comprehensive Guide",
      category: "Chronic Care",
      excerpt: "Learn how to manage your diabetes through diet, exercise, and medication. Discover tips for monitoring your blood sugar levels and preventing complications.",
      content: "Diabetes management requires a comprehensive approach that includes medication, diet, exercise, and regular monitoring. This article provides detailed guidance on...",
      author: "Dr. Amina Patel",
      publishedDate: "2025-05-01",
      readTime: "8 min read",
      image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 2,
      title: "Post-Surgery Recovery: What to Expect",
      category: "Post-Surgery",
      excerpt: "Understand the recovery process after surgery. Learn about pain management, wound care, and when to seek medical attention during your recovery period.",
      content: "Recovery after surgery is a critical period that requires careful attention. This guide covers everything from pain management to wound care and signs of complications...",
      author: "Dr. Raj Singh",
      publishedDate: "2025-04-28",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 3,
      title: "Heart-Healthy Eating: Foods That Protect Your Heart",
      category: "Nutrition",
      excerpt: "Discover the best foods for heart health and learn how to incorporate them into your daily diet. Simple recipes and meal planning tips included.",
      content: "A heart-healthy diet is one of the most effective ways to prevent cardiovascular disease. This article explores the best foods for your heart and provides practical tips...",
      author: "Dr. Sarah Johnson",
      publishedDate: "2025-04-25",
      readTime: "5 min read",
      image: "https://images.unsplash.com/photo-1490818387583-1baba5e638af?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 4,
      title: "Understanding Blood Pressure: High vs. Low",
      category: "General",
      excerpt: "Learn about blood pressure, what the numbers mean, and how to maintain healthy levels. Discover lifestyle changes that can help regulate your blood pressure.",
      content: "Blood pressure is a critical indicator of cardiovascular health. Understanding what your numbers mean and how to maintain healthy levels is essential for long-term wellbeing...",
      author: "Dr. Michael Chen",
      publishedDate: "2025-04-22",
      readTime: "7 min read",
      image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 5,
      title: "Exercise for Seniors: Safe and Effective Workouts",
      category: "General",
      excerpt: "Discover safe and effective exercises designed specifically for seniors. Improve mobility, strength, and balance with these easy-to-follow workout routines.",
      content: "Regular exercise is crucial for maintaining health and independence in senior years. This guide provides safe and effective workouts tailored for seniors, focusing on...",
      author: "Dr. Emily Rodriguez",
      publishedDate: "2025-04-20",
      readTime: "6 min read",
      image: "https://images.unsplash.com/photo-1548839140-29a7469831e0?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    },
    {
      id: 6,
      title: "Asthma Management: Breathing Easier Every Day",
      category: "Chronic Care",
      excerpt: "Learn how to manage asthma effectively with proper medication, trigger avoidance, and emergency preparedness. Create your personalized asthma action plan.",
      content: "Asthma management requires a comprehensive approach that includes medication, trigger avoidance, and emergency preparedness. This article provides detailed guidance on...",
      author: "Dr. David Wilson",
      publishedDate: "2025-04-18",
      readTime: "9 min read",
      image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
    }
  ];

  // Load articles and favorites
  useEffect(() => {
    setLoading(true);
    // Simulate API call
    setTimeout(() => {
      setArticles(mockArticles);
      // Load favorites from localStorage
      const savedFavorites = localStorage.getItem('healthFavorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      setLoading(false);
    }, 1000);
  }, []);

  // Filter articles
  const filteredArticles = articles.filter(article => {
    if (filters.category !== 'all' && article.category !== filters.category) return false;
    if (filters.search && !article.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !article.excerpt.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    return true;
  });

  // Toggle favorite
  const toggleFavorite = (articleId) => {
    const newFavorites = favorites.includes(articleId)
      ? favorites.filter(id => id !== articleId)
      : [...favorites, articleId];
    
    setFavorites(newFavorites);
    localStorage.setItem('healthFavorites', JSON.stringify(newFavorites));
    
    setMessage({
      type: 'success',
      text: favorites.includes(articleId) ? 'Removed from favorites' : 'Added to favorites'
    });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  if (loading) {
    return (
      <div className="health-awareness-container">
        <Navbar />
        <div className="health-awareness-content">
          <Sidebar />
          <main className="health-awareness-main">
            <div className="hospital-loading">
              <div className="hospital-spinner"></div>
              <p>Loading health awareness content...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="health-awareness-container">
      <Navbar />
      <div className="health-awareness-content">
        <Sidebar />
        <main className="health-awareness-main">
          <div className="hospital-header">
            <h1 className="hospital-title">📚 Health Awareness</h1>
            <p className="hospital-subtitle">
              Educational resources to help you maintain and improve your health
            </p>
          </div>

          {/* Message Toast */}
          {message.text && (
            <div className={`hospital-message hospital-message--${message.type}`}>
              {message.text}
            </div>
          )}

          {/* Stats Cards */}
          <div className="hospital-stats-grid">
            <Card variant="highlight" header="Total Articles">
              <div className="stat-value">{articles.length}</div>
              <div className="stat-label">Educational resources</div>
            </Card>

            <Card variant="default" header="Categories">
              <div className="stat-value">4</div>
              <div className="stat-label">General, Chronic Care, Post-Surgery, Nutrition</div>
            </Card>

            <Card variant="secondary" header="Your Favorites">
              <div className="stat-value">{favorites.length}</div>
              <div className="stat-label">Saved for later reading</div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="filters-card">
            <div className="hospital-filters">
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="hospital-filter-select"
              >
                <option value="all">All Categories</option>
                <option value="General">General Health</option>
                <option value="Chronic Care">Chronic Care</option>
                <option value="Post-Surgery">Post-Surgery</option>
                <option value="Nutrition">Nutrition</option>
              </select>
              <input
                type="text"
                placeholder="Search articles..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="hospital-search-input"
              />
            </div>
          </Card>

          {/* Articles Grid */}
          <div className="articles-grid">
            {filteredArticles.length > 0 ? (
              filteredArticles.map(article => (
                <Card key={article.id} className="article-card">
                  <div className="article-image">
                    <img src={article.image} alt={article.title} />
                  </div>
                  <div className="article-category">
                    <span className="category-badge">{article.category}</span>
                  </div>
                  <div className="article-content">
                    <h3 className="article-title">{article.title}</h3>
                    <p className="article-excerpt">{article.excerpt}</p>
                    <div className="article-meta">
                      <span className="author">By {article.author}</span>
                      <span className="published-date">{article.publishedDate}</span>
                      <span className="read-time">{article.readTime}</span>
                    </div>
                  </div>
                  <div className="article-actions">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setSelectedArticle(article)}
                    >
                      Read More
                    </Button>
                    <Button
                      variant={favorites.includes(article.id) ? "secondary" : "outline"}
                      size="sm"
                      onClick={() => toggleFavorite(article.id)}
                      className="favorite-btn"
                    >
                      {favorites.includes(article.id) ? '★ Favorited' : '☆ Favorite'}
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="no-articles">
                <div className="no-articles-icon">📋</div>
                <h3>No articles found</h3>
                <p>Try adjusting your search or category filter to find relevant health content.</p>
              </div>
            )}
          </div>

          {/* Article Detail Modal */}
          {selectedArticle && (
            <div className="hospital-modal-overlay">
              <div className="hospital-modal article-modal">
                <div className="hospital-modal-header">
                  <h3>{selectedArticle.title}</h3>
                  <button 
                    onClick={() => setSelectedArticle(null)}
                    className="hospital-modal-close"
                  >
                    ✕
                  </button>
                </div>
                <div className="hospital-modal-body">
                  <div className="article-detail">
                    <img src={selectedArticle.image} alt={selectedArticle.title} className="detail-image" />
                    <div className="detail-meta">
                      <span className="category-badge">{selectedArticle.category}</span>
                      <span className="author">By {selectedArticle.author}</span>
                      <span className="published-date">{selectedArticle.publishedDate}</span>
                      <span className="read-time">{selectedArticle.readTime}</span>
                    </div>
                    <div className="detail-content">
                      <p>{selectedArticle.content}</p>
                      <p>For more information or if you have specific health concerns, please consult with your healthcare provider or schedule an appointment with one of our specialists.</p>
                    </div>
                  </div>
                  <div className="modal-actions">
                    <Button
                      variant={favorites.includes(selectedArticle.id) ? "secondary" : "outline"}
                      onClick={() => toggleFavorite(selectedArticle.id)}
                    >
                      {favorites.includes(selectedArticle.id) ? '★ Favorited' : '☆ Favorite'}
                    </Button>
                    <Button
                      variant="primary"
                      onClick={() => setSelectedArticle(null)}
                    >
                      Close
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}