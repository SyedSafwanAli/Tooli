import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../services/api';
import { useSEO } from '../utils/useSEO';
import LoadingSpinner from '../components/common/LoadingSpinner';

export default function Blog() {
  const [posts, setPosts]   = useState([]);
  const [loading, setLoading] = useState(true);

  useSEO({
    title: 'Blog — Tooli',
    description: 'Tips, guides, and tutorials on image compression, PDF tools, developer utilities, and more.',
  });

  useEffect(() => {
    api.get('/blog')
      .then(r => setPosts(r.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="bg-[#2563EB] text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-3"
          >
            Tooli Blog
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-blue-100 text-lg"
          >
            Tips, tutorials, and deep-dives on all things web tools
          </motion.p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex justify-center py-20"><LoadingSpinner text="Loading posts…" /></div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">✍️</p>
            <p className="text-gray-500 text-lg">No posts yet — check back soon!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, i) => (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow"
              >
                {post.coverImage && (
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {(post.tags || []).slice(0, 3).map(tag => (
                      <span key={tag} className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-medium">
                        {tag}
                      </span>
                    ))}
                    {post.publishedAt && (
                      <span className="text-xs text-gray-400 ml-auto">
                        {new Date(post.publishedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2 hover:text-blue-600 transition-colors">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.metaDescription && (
                    <p className="text-gray-500 text-sm leading-relaxed line-clamp-2">{post.metaDescription}</p>
                  )}
                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-blue-600 hover:gap-2.5 transition-all"
                  >
                    Read more →
                  </Link>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
