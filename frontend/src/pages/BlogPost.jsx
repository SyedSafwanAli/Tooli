import { useEffect, useState } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { marked } from 'marked';
import api from '../services/api';
import { useSEO } from '../utils/useSEO';
import LoadingSpinner from '../components/common/LoadingSpinner';

marked.setOptions({ breaks: true, gfm: true });

export default function BlogPost() {
  const { slug } = useParams();
  const [post, setPost]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.get(`/blog/${slug}`)
      .then(r => setPost(r.data.data))
      .catch(err => {
        if (err.response?.status === 404) setNotFound(true);
      })
      .finally(() => setLoading(false));
  }, [slug]);

  useSEO({
    title: post ? `${post.metaTitle || post.title} — Tooli Blog` : 'Blog — Tooli',
    description: post?.metaDescription || '',
    keywords: (post?.tags || []).join(', '),
  });

  if (loading) return <div className="flex justify-center items-center min-h-[60vh]"><LoadingSpinner text="Loading…" /></div>;
  if (notFound) return <Navigate to="/blog" replace />;
  if (!post) return null;

  const html = post.contentType === 'html'
    ? (post.content || '')
    : marked.parse(post.content || '');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover */}
      {post.coverImage && (
        <div className="w-full h-64 sm:h-80 overflow-hidden">
          <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 py-10">
        {/* Breadcrumb */}
        <nav className="text-xs text-gray-400 mb-6 flex items-center gap-1.5">
          <Link to="/" className="hover:text-gray-700">Home</Link>
          <span>›</span>
          <Link to="/blog" className="hover:text-gray-700">Blog</Link>
          <span>›</span>
          <span className="text-gray-600">{post.title}</span>
        </nav>

        <motion.article
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
        >
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(post.tags || []).map(tag => (
              <span key={tag} className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-full font-medium">
                {tag}
              </span>
            ))}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">{post.title}</h1>

          {/* Meta */}
          {post.publishedAt && (
            <p className="text-sm text-gray-400 mb-8 pb-6 border-b border-gray-100">
              Published{' '}
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
            </p>
          )}

          {/* Content */}
          <div
            className="prose prose-sm sm:prose max-w-none text-gray-700 prose-headings:text-gray-900 prose-a:text-blue-600 prose-code:bg-gray-100 prose-code:px-1 prose-code:rounded"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </motion.article>

        {/* Back link */}
        <div className="mt-8 text-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
          >
            ← Back to Blog
          </Link>
        </div>
      </div>
    </div>
  );
}
