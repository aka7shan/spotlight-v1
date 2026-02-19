import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { portfolioData } from '../../data/portfolio';
import { useStore } from '../../store/useStore';

interface StoryItem {
  id: string;
  label: string;
  icon: string;
  content: string[];
}

interface PostItem {
  id: string;
  type: 'experience' | 'project' | 'education';
  title: string;
  subtitle: string;
  duration: string;
  bullets: string[];
  tags: string[];
  likes: number;
  comments: number;
  icon: string;
}

export default function InstagramTheme() {
  const setTheme = useStore((s) => s.setTheme);
  const visitSection = useStore((s) => s.visitSection);
  const [activeStory, setActiveStory] = useState<StoryItem | null>(null);
  const [storyProgress, setStoryProgress] = useState(0);
  const [storyPage, setStoryPage] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  const [showComments, setShowComments] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);
  const [isDesktop, setIsDesktop] = useState(false);
  const [activeTab, setActiveTab] = useState<'posts' | 'reels' | 'tagged'>('posts');
  const storyTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Responsive: detect desktop vs mobile
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Stories data
  const stories: StoryItem[] = [
    {
      id: 'skills-lang',
      label: 'Languages',
      icon: '👨‍💻',
      content: portfolioData.skills[0].skills,
    },
    {
      id: 'skills-fw',
      label: 'Frameworks',
      icon: '⚛️',
      content: portfolioData.skills[1].skills,
    },
    {
      id: 'skills-db',
      label: 'Databases',
      icon: '🗄️',
      content: portfolioData.skills[2].skills,
    },
    {
      id: 'skills-cloud',
      label: 'Cloud',
      icon: '☁️',
      content: portfolioData.skills[5].skills,
    },
    {
      id: 'certs',
      label: 'Certs',
      icon: '📜',
      content: portfolioData.certifications.map((c) => `${c.name} — ${c.issuer}`),
    },
    {
      id: 'education',
      label: 'Education',
      icon: '🎓',
      content: [
        portfolioData.education[0].institution,
        portfolioData.education[0].degree,
        portfolioData.education[0].gpa,
        portfolioData.education[0].duration,
      ],
    },
  ];

  // Posts data — fully detailed
  const posts: PostItem[] = [
    ...portfolioData.experience.map((exp, i) => ({
      id: `exp-${i}`,
      type: 'experience' as const,
      title: exp.company,
      subtitle: exp.role,
      duration: exp.duration,
      bullets: exp.bullets,
      tags: exp.techStack.split(', '),
      likes: 120 + Math.floor(Math.random() * 200),
      comments: 10 + Math.floor(Math.random() * 30),
      icon: '💼',
    })),
    ...portfolioData.projects.map((proj, i) => ({
      id: `proj-${i}`,
      type: 'project' as const,
      title: proj.name,
      subtitle: proj.techStack,
      duration: proj.year,
      bullets: proj.bullets,
      tags: proj.techStack.split(', '),
      likes: 200 + Math.floor(Math.random() * 300),
      comments: 15 + Math.floor(Math.random() * 40),
      icon: '🚀',
    })),
    {
      id: 'edu-0',
      type: 'education' as const,
      title: portfolioData.education[0].institution,
      subtitle: portfolioData.education[0].degree,
      duration: portfolioData.education[0].duration,
      bullets: [
        `CGPA: ${portfolioData.education[0].gpa}`,
        `Location: ${portfolioData.education[0].location || 'India'}`,
        `Duration: ${portfolioData.education[0].duration}`,
      ],
      tags: ['Computer Science', 'B.Tech'],
      likes: 340,
      comments: 45,
      icon: '🎓',
    },
  ];

  // Story timer
  useEffect(() => {
    if (activeStory) {
      setStoryProgress(0);
      if (storyTimerRef.current) clearInterval(storyTimerRef.current);
      storyTimerRef.current = setInterval(() => {
        setStoryProgress((prev) => {
          if (prev >= 100) {
            setStoryPage((p) => {
              if (p < activeStory.content.length - 1) {
                return p + 1;
              } else {
                setActiveStory(null);
                return 0;
              }
            });
            return 0;
          }
          return prev + 2;
        });
      }, 60);
      return () => {
        if (storyTimerRef.current) clearInterval(storyTimerRef.current);
      };
    }
  }, [activeStory, storyPage]);

  const toggleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  const toggleSave = (postId: string) => {
    setSavedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
  };

  useEffect(() => {
    visitSection('about');
  }, [visitSection]);

  const gradients = [
    'from-pink-600 via-purple-600 to-blue-600',
    'from-orange-500 via-red-500 to-pink-600',
    'from-blue-600 via-cyan-500 to-emerald-500',
    'from-purple-600 via-pink-500 to-red-500',
    'from-yellow-500 via-orange-500 to-red-600',
  ];

  const fakeComments = [
    { user: 'tech_recruiter', text: 'Impressive stack! 🔥', time: '2h', avatar: 'from-purple-500 to-pink-500' },
    { user: 'dev_community', text: 'Love the architecture choices', time: '5h', avatar: 'from-blue-500 to-cyan-500' },
    { user: 'startup_cto', text: 'This is exactly what we need in our team', time: '1d', avatar: 'from-green-500 to-emerald-500' },
    { user: 'code_reviewer', text: 'Clean code, clean portfolio 👏', time: '2d', avatar: 'from-orange-500 to-red-500' },
    { user: 'senior_dev', text: 'The microservices work is solid 💪', time: '3d', avatar: 'from-indigo-500 to-purple-500' },
  ];

  // ── Shared: Story Viewer Overlay ──
  const storyViewer = (
    <AnimatePresence>
      {activeStory && (
        <motion.div
          className="fixed inset-0 z-50 bg-black flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Progress bars */}
          <div className="absolute top-2 left-2 right-2 flex gap-1 z-10">
            {activeStory.content.map((_, i) => (
              <div key={i} className="flex-1 h-0.5 bg-gray-600 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-100"
                  style={{
                    width: i < storyPage ? '100%' : i === storyPage ? `${storyProgress}%` : '0%',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Story header */}
          <div className="absolute top-6 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm">
                {activeStory.icon}
              </div>
              <span className="text-sm font-semibold text-white">{activeStory.label}</span>
            </div>
            <button
              onClick={() => { setActiveStory(null); setStoryPage(0); }}
              className="text-white text-xl cursor-pointer"
            >
              ✕
            </button>
          </div>

          {/* Story content */}
          <motion.div
            key={storyPage}
            className="text-center px-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              {activeStory.content[storyPage]}
            </p>
            <p className="text-gray-500 mt-4 text-sm">
              {storyPage + 1} / {activeStory.content.length}
            </p>
          </motion.div>

          {/* Tap zones */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer"
            onClick={() => setStoryPage((p) => Math.max(0, p - 1))}
          />
          <div
            className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer"
            onClick={() => {
              if (storyPage < activeStory.content.length - 1) {
                setStoryPage((p) => p + 1);
                setStoryProgress(0);
              } else {
                setActiveStory(null);
                setStoryPage(0);
              }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Shared: Comment Drawer ──
  const commentDrawer = (
    <AnimatePresence>
      {showComments && (
        <motion.div
          className="fixed inset-0 z-40 bg-black/60"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowComments(null)}
        >
          <motion.div
            className="absolute bottom-0 left-0 right-0 bg-[#262626] rounded-t-2xl max-h-[60vh] overflow-y-auto"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-700 text-center">
              <div className="w-10 h-1 bg-gray-600 rounded-full mx-auto mb-3" />
              <h3 className="font-semibold text-white">Comments</h3>
            </div>
            <div className="p-4 space-y-4">
              {fakeComments.map((comment, i) => (
                <div key={i} className="flex gap-3">
                  <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${comment.avatar} shrink-0`} />
                  <div>
                    <p className="text-sm text-white">
                      <span className="font-semibold">{comment.user}</span>{' '}
                      <span className="text-gray-300">{comment.text}</span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{comment.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Shared: Post Detail Modal (for desktop grid click) ──
  const postModal = (
    <AnimatePresence>
      {selectedPost && (
        <motion.div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setSelectedPost(null)}
        >
          <motion.div
            className="bg-[#262626] rounded-xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col md:flex-row"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Left: Gradient hero */}
            <div className={`md:w-1/2 bg-gradient-to-br ${gradients[posts.indexOf(selectedPost) % gradients.length]} flex items-center justify-center p-8 min-h-[200px] md:min-h-0`}>
              <div className="text-center">
                <p className="text-4xl mb-3">{selectedPost.icon}</p>
                <h3 className="text-xl font-black text-white drop-shadow-lg">{selectedPost.title}</h3>
                <p className="text-sm text-white/80 mt-1">{selectedPost.subtitle}</p>
                <p className="text-xs text-white/60 mt-1">{selectedPost.duration}</p>
              </div>
            </div>

            {/* Right: Content */}
            <div className="md:w-1/2 flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm">
                    {selectedPost.icon}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{selectedPost.title}</p>
                    <p className="text-xs text-gray-400">{selectedPost.subtitle}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedPost(null)} className="text-gray-400 hover:text-white cursor-pointer text-lg">✕</button>
              </div>

              {/* Scrollable content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                <p className="text-sm font-semibold text-white">{portfolioData.name.toLowerCase().replace(' ', '_')}</p>
                {selectedPost.bullets.map((bullet, i) => (
                  <p key={i} className="text-sm text-gray-300 leading-relaxed">
                    <span className="text-white">▸</span> {bullet}
                  </p>
                ))}
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {selectedPost.tags.map((tag) => (
                    <span key={tag} className="text-xs text-blue-400">#{tag.replace(/[\s/()]/g, '')}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-4">
                    <button onClick={() => toggleLike(selectedPost.id)} className="cursor-pointer text-xl hover:scale-110 transition-transform">
                      {likedPosts.has(selectedPost.id) ? '❤️' : '🤍'}
                    </button>
                    <button onClick={() => { setShowComments(selectedPost.id); setSelectedPost(null); }} className="cursor-pointer text-xl hover:scale-110 transition-transform">💬</button>
                    <button className="cursor-pointer text-xl hover:scale-110 transition-transform">📤</button>
                  </div>
                  <button onClick={() => toggleSave(selectedPost.id)} className="cursor-pointer text-xl hover:scale-110 transition-transform">
                    {savedPosts.has(selectedPost.id) ? '🔖' : '🏷️'}
                  </button>
                </div>
                <p className="text-sm font-semibold text-white">{likedPosts.has(selectedPost.id) ? selectedPost.likes + 1 : selectedPost.likes} likes</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  // ── Shared: Stories Row ──
  const storiesRow = (
    <motion.div
      className="flex gap-4 px-4 py-3 overflow-x-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      {stories.map((story) => (
        <button
          key={story.id}
          className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group"
          onClick={() => {
            setActiveStory(story);
            setStoryPage(0);
            setStoryProgress(0);
            if (story.id.startsWith('skills')) visitSection('skills');
            else if (story.id === 'certs') visitSection('certifications');
            else if (story.id === 'education') visitSection('education');
          }}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-pink-500 via-red-500 to-orange-500 p-0.5 group-hover:scale-105 transition-transform">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-2xl md:text-3xl">
              {story.icon}
            </div>
          </div>
          <span className="text-[10px] md:text-xs text-gray-400">{story.label}</span>
        </button>
      ))}
    </motion.div>
  );

  // ── Mobile: Full post card in feed ──
  const renderMobilePost = (post: PostItem, index: number) => (
    <motion.div
      key={post.id}
      className="border-b border-gray-800"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.4 }}
      onViewportEnter={() => visitSection(post.type === 'experience' ? 'experience' : post.type === 'project' ? 'projects' : 'education')}
    >
      {/* Post header */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-sm">
          {post.icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{post.title}</p>
          <p className="text-xs text-gray-500 truncate">{post.subtitle}</p>
        </div>
        <span className="text-gray-500 text-xs shrink-0">{post.duration}</span>
      </div>

      {/* Gradient hero — landscape ratio, not square */}
      <div className={`w-full aspect-[16/10] bg-gradient-to-br ${gradients[index % gradients.length]} flex items-center justify-center p-6`}>
        <div className="text-center">
          <p className="text-3xl mb-2">{post.icon}</p>
          <h3 className="text-xl md:text-2xl font-black text-white drop-shadow-lg">
            {post.title}
          </h3>
          <p className="text-sm text-white/80 mt-1">{post.subtitle}</p>
          <div className="flex flex-wrap gap-2 mt-3 justify-center">
            {post.tags.slice(0, 5).map((tag) => (
              <span key={tag} className="text-xs bg-white/20 text-white px-2.5 py-0.5 rounded-full backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Post actions */}
      <div className="px-4 py-2.5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-4">
            <button onClick={() => toggleLike(post.id)} className="cursor-pointer text-xl hover:scale-110 transition-transform">
              {likedPosts.has(post.id) ? '❤️' : '🤍'}
            </button>
            <button onClick={() => setShowComments(post.id)} className="cursor-pointer text-xl hover:scale-110 transition-transform">💬</button>
            <button className="cursor-pointer text-xl hover:scale-110 transition-transform">📤</button>
          </div>
          <button onClick={() => toggleSave(post.id)} className="cursor-pointer text-xl hover:scale-110 transition-transform">
            {savedPosts.has(post.id) ? '🔖' : '🏷️'}
          </button>
        </div>

        <p className="text-sm font-semibold">{likedPosts.has(post.id) ? post.likes + 1 : post.likes} likes</p>

        {/* Caption with ALL bullet points */}
        <div className="mt-1.5">
          <p className="text-sm font-semibold inline">{portfolioData.name.toLowerCase().replace(' ', '_')}{' '}</p>
          <span className="text-sm text-gray-300">{post.bullets[0]}</span>
        </div>
        {post.bullets.length > 1 && (
          <div className="mt-2 space-y-1.5">
            {post.bullets.slice(1).map((bullet, j) => (
              <p key={j} className="text-sm text-gray-400 leading-relaxed">▸ {bullet}</p>
            ))}
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {post.tags.map((tag) => (
            <span key={tag} className="text-xs text-blue-400">#{tag.replace(/[\s/()]/g, '')}</span>
          ))}
        </div>

        <button
          onClick={() => setShowComments(post.id)}
          className="text-gray-500 text-sm mt-2 cursor-pointer block"
        >
          View all {post.comments} comments
        </button>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {storyViewer}
      {commentDrawer}
      {postModal}

      {/* ── Header / Nav ── */}
      <motion.header
        className="sticky top-0 z-30 bg-black/90 backdrop-blur-md border-b border-gray-800"
        initial={{ y: -60 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={`${isDesktop ? 'max-w-4xl' : 'max-w-lg'} mx-auto flex items-center justify-between px-4 py-3`}>
          <button
            onClick={() => setTheme('landing')}
            className="text-gray-400 hover:text-white transition-colors cursor-pointer text-sm"
          >
            ← Back
          </button>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-orange-500 bg-clip-text text-transparent">
            {isDesktop ? 'Instagram' : 'akarshan.dev'}
          </h1>
          <a
            href={`mailto:${portfolioData.email}`}
            className="text-sm text-gray-400 hover:text-white transition-colors no-underline"
          >
            ✉️
          </a>
        </div>
      </motion.header>

      <div className={`${isDesktop ? 'max-w-4xl' : 'max-w-lg'} mx-auto`}>

        {/* ── Profile Header ── */}
        {isDesktop ? (
          /* ── DESKTOP: Instagram Web style ── */
          <motion.div
            className="flex gap-12 px-8 py-10 border-b border-gray-800"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Large avatar */}
            <div className="relative shrink-0">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 p-[3px]">
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-6xl">
                  👨‍💻
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-6 h-6 flex items-center justify-center text-xs border-2 border-black">
                ✓
              </div>
            </div>

            {/* Profile info */}
            <div className="flex-1">
              {/* Username row */}
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-xl font-light">{portfolioData.name.toLowerCase().replace(' ', '_')}</h2>
                <a
                  href={`mailto:${portfolioData.email}`}
                  className="bg-blue-500 text-white text-sm font-semibold px-6 py-1.5 rounded-lg no-underline hover:bg-blue-600 transition-colors"
                >
                  Contact
                </a>
                <a
                  href={`https://${portfolioData.linkedin}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-[#363636] text-white text-sm font-semibold px-6 py-1.5 rounded-lg no-underline hover:bg-[#444] transition-colors"
                >
                  LinkedIn
                </a>
              </div>

              {/* Stats row */}
              <div className="flex gap-10 mb-4">
                <p><span className="font-bold">{posts.length}</span> posts</p>
                <p><span className="font-bold">{portfolioData.skills.reduce((a, s) => a + s.skills.length, 0)}+</span> skills</p>
                <p><span className="font-bold">{portfolioData.certifications.length}</span> certifications</p>
              </div>

              {/* Bio */}
              <div>
                <p className="font-bold text-sm">{portfolioData.name}</p>
                <p className="text-sm text-gray-400">{portfolioData.title}</p>
                <p className="text-sm mt-1 text-gray-300 leading-relaxed">{portfolioData.summary}</p>
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span>📧 {portfolioData.email}</span>
                  <span>•</span>
                  <span>🔗 {portfolioData.linkedin}</span>
                  <span>•</span>
                  <span>💻 {portfolioData.leetcode}</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          /* ── MOBILE: Instagram App style ── */
          <motion.div
            className="px-4 py-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-pink-500 via-purple-500 to-orange-500 p-0.5">
                  <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-3xl">
                    👨‍💻
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full w-5 h-5 flex items-center justify-center text-[10px] border-2 border-black">
                  ✓
                </div>
              </div>
              <div className="flex-1 flex justify-around">
                <div className="text-center">
                  <p className="font-bold text-lg">{posts.length}</p>
                  <p className="text-xs text-gray-400">Posts</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{portfolioData.skills.reduce((a, s) => a + s.skills.length, 0)}+</p>
                  <p className="text-xs text-gray-400">Skills</p>
                </div>
                <div className="text-center">
                  <p className="font-bold text-lg">{portfolioData.certifications.length}</p>
                  <p className="text-xs text-gray-400">Certs</p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <h2 className="font-bold text-sm">{portfolioData.name}</h2>
              <p className="text-sm text-gray-400">{portfolioData.title}</p>
              <p className="text-sm mt-2 text-gray-300 leading-relaxed">{portfolioData.summary}</p>
              <div className="flex gap-2 mt-2 text-xs text-gray-500 flex-wrap">
                <span>📧 {portfolioData.email}</span>
                <span>•</span>
                <span>🔗 {portfolioData.linkedin}</span>
              </div>
            </div>

            <div className="flex gap-2 mt-4">
              <a
                href={`mailto:${portfolioData.email}`}
                className="flex-1 bg-blue-500 text-white text-sm font-semibold py-1.5 rounded-lg text-center no-underline hover:bg-blue-600 transition-colors"
              >
                Contact
              </a>
              <a
                href={`https://${portfolioData.linkedin}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 bg-[#363636] text-white text-sm font-semibold py-1.5 rounded-lg text-center no-underline hover:bg-[#444] transition-colors"
              >
                LinkedIn
              </a>
            </div>
          </motion.div>
        )}

        {/* ── Stories (desktop: bigger, below profile border) ── */}
        <div className="border-b border-gray-800">
          {storiesRow}
        </div>

        {/* ── Tab Bar ── */}
        <div className="flex border-b border-gray-800">
          <button
            className={`flex-1 py-3 text-center text-sm cursor-pointer transition-colors ${activeTab === 'posts' ? 'border-b-2 border-white text-white' : 'text-gray-500'}`}
            onClick={() => setActiveTab('posts')}
          >
            {isDesktop ? '🔳 POSTS' : '📷 Posts'}
          </button>
          <button
            className={`flex-1 py-3 text-center text-sm cursor-pointer transition-colors ${activeTab === 'reels' ? 'border-b-2 border-white text-white' : 'text-gray-500'}`}
            onClick={() => { setActiveTab('reels'); visitSection('projects'); }}
          >
            🎬 Reels
          </button>
          <button
            className={`flex-1 py-3 text-center text-sm cursor-pointer transition-colors ${activeTab === 'tagged' ? 'border-b-2 border-white text-white' : 'text-gray-500'}`}
            onClick={() => { setActiveTab('tagged'); visitSection('certifications'); }}
          >
            🏷️ Tagged
          </button>
        </div>

        {/* ── Content Area ── */}
        {activeTab === 'posts' && (
          <>
            {isDesktop ? (
              /* ── DESKTOP: 3-column grid (Instagram Web style) ── */
              <div className="grid grid-cols-3 gap-1 pb-20">
                {posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    className={`aspect-square bg-gradient-to-br ${gradients[i % gradients.length]} cursor-pointer relative group overflow-hidden`}
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() => {
                      setSelectedPost(post);
                      visitSection(post.type === 'experience' ? 'experience' : post.type === 'project' ? 'projects' : 'education');
                    }}
                  >
                    {/* Content */}
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                      <p className="text-3xl mb-2">{post.icon}</p>
                      <p className="text-sm font-bold text-white drop-shadow-lg leading-tight">{post.title}</p>
                      <p className="text-xs text-white/70 mt-1">{post.subtitle}</p>
                      <p className="text-[10px] text-white/50 mt-0.5">{post.duration}</p>
                    </div>

                    {/* Hover overlay with likes & comments */}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
                      <span className="flex items-center gap-1.5 text-white font-bold text-sm">❤️ {post.likes}</span>
                      <span className="flex items-center gap-1.5 text-white font-bold text-sm">💬 {post.comments}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              /* ── MOBILE: Feed with detailed cards ── */
              <div className="pb-20">
                {posts.map((post, i) => renderMobilePost(post, i))}
              </div>
            )}
          </>
        )}

        {activeTab === 'reels' && (
          <div className="grid grid-cols-3 gap-1 pb-20">
            {portfolioData.projects.map((proj, i) => (
              <motion.div
                key={i}
                className={`aspect-[9/16] bg-gradient-to-br ${gradients[i % gradients.length]} flex items-center justify-center p-3 text-center`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <div>
                  <p className="text-2xl mb-1">🚀</p>
                  <p className="text-xs font-bold text-white">{proj.name}</p>
                  <p className="text-[10px] text-white/70 mt-0.5">{proj.techStack}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {activeTab === 'tagged' && (
          <div className="p-6 space-y-4">
            {portfolioData.certifications.map((cert, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-4 bg-[#1a1a1a] rounded-xl p-4"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl">📜</div>
                <div>
                  <p className="text-sm font-semibold">{cert.name}</p>
                  <p className="text-xs text-gray-400">{cert.issuer}</p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bottom Nav ── */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-md border-t border-gray-800 z-30">
        <div className={`${isDesktop ? 'max-w-4xl' : 'max-w-lg'} mx-auto flex items-center justify-around py-2`}>
          <button className="p-2 text-xl cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            🏠
          </button>
          <button className="p-2 text-xl cursor-pointer opacity-50">🔍</button>
          <button className="p-2 text-xl cursor-pointer opacity-50">🎬</button>
          <button className="p-2 text-xl cursor-pointer opacity-50">🛒</button>
          <button
            className="p-2 cursor-pointer"
            onClick={() => setTheme('landing')}
          >
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 border-2 border-white" />
          </button>
        </div>
      </div>
    </div>
  );
}
