'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import TextField from '@mui/material/TextField';
import Badge from '@mui/material/Badge';
import Divider from '@mui/material/Divider';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import {
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  BellIcon,
  ExclamationTriangleIcon,
  Link2Icon,
  GlobeIcon,
  Cross1Icon,
  CheckCircledIcon,
  DotsHorizontalIcon,
  Share1Icon,
  BookmarkIcon,
  PlusIcon,
} from '@radix-ui/react-icons';

export interface SocialMediaPost {
  id: string;
  author: { id: string; name: string; avatar: string; isVerified: boolean; isFake?: boolean; mutualFriends?: number };
  content: string;
  image?: string;
  link?: { url: string; title: string; description: string; isSuspicious?: boolean };
  timestamp: string;
  likes: number;
  comments: number;
  shares: number;
  isSponsored?: boolean;
  isPhishing?: boolean;
  warnings?: string[];
}

export interface SocialMediaStory {
  id: string;
  author: { name: string; avatar: string; isFake?: boolean };
  content: string;
  hasLink?: boolean;
  linkUrl?: string;
  isSuspicious?: boolean;
  viewed: boolean;
}

export interface SocialMediaMessage {
  id: string;
  sender: { name: string; avatar: string; isFake?: boolean };
  text: string;
  timestamp: string;
  hasLink?: boolean;
  linkUrl?: string;
  isSuspicious?: boolean;
}

interface SocialMediaSimulatorProps {
  posts: SocialMediaPost[];
  stories?: SocialMediaStory[];
  messages?: SocialMediaMessage[];
  onAction: (action: string, data?: any) => void;
  showWarnings?: boolean;
}

type TabValue = 'feed' | 'stories' | 'messages' | 'profile';

export default function SocialMediaSimulator({
  posts: initialPosts, stories = [], messages = [], onAction, showWarnings = true,
}: SocialMediaSimulatorProps) {
  const [posts, setPosts] = useState(initialPosts);
  const [activeTab, setActiveTab] = useState<TabValue>('feed');
  const [selectedPost, setSelectedPost] = useState<SocialMediaPost | null>(null);
  const [showPostDetails, setShowPostDetails] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [showNewPost, setShowNewPost] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [showAlert, setShowAlert] = useState<string | null>(null);

  const suspiciousPosts = posts.filter((p) => p.isPhishing || p.warnings?.length);
  const unreadMessages = messages.filter((m) => m.isSuspicious);

  const handlePostClick = (post: SocialMediaPost) => {
    setSelectedPost(post);
    setShowPostDetails(true);
    if (post.isPhishing) onAction('suspicious_post', post);
  };

  const handleLinkClick = (url: string, isSuspicious?: boolean) => {
    if (isSuspicious) {
      onAction('suspicious_link', { url });
      setShowAlert('suspicious_link');
    } else {
      onAction('link_click', { url });
    }
    setTimeout(() => setShowAlert(null), 3000);
  };

  const handleLike = (postId: string) => {
    setLikedPosts((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) next.delete(postId);
      else next.add(postId);
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, likes: likedPosts.has(postId) ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
  };

  const handleReportPost = (postId: string) => {
    onAction('report_post', postId);
    setShowPostDetails(false);
    setShowAlert('reported');
    setTimeout(() => setShowAlert(null), 3000);
  };

  const handleNewPost = () => {
    if (!newPostText.trim()) return;
    onAction('new_post', newPostText);
    setShowNewPost(false);
    setNewPostText('');
    setShowAlert('post_created');
    setTimeout(() => setShowAlert(null), 3000);
  };

  return (
    <Paper sx={{ height: 680, display: 'flex', flexDirection: 'column', borderRadius: 0, overflow: 'hidden', border: '1px solid #DCE1E6', bgcolor: '#EDEEF0', maxWidth: 450, mx: 'auto', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', position: 'relative' }}>
      {}
      <Box sx={{ bgcolor: '#FFFFFF', borderBottom: '1px solid #DCE1E6', px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography sx={{ fontWeight: 800, fontSize: '1.35rem', color: '#2787F5', flex: 1, letterSpacing: '-0.5px' }}>VK</Typography>
        <IconButton size="small"><MagnifyingGlassIcon style={{ fontSize: 20, color: '#99A2AD' }} /></IconButton>
        <Badge badgeContent={unreadMessages.length} color="error">
          <IconButton size="small"><BellIcon style={{ fontSize: 20, color: '#99A2AD' }} /></IconButton>
        </Badge>
      </Box>

      {}
      {showWarnings && suspiciousPosts.length > 0 && activeTab === 'feed' && (
        <Box sx={{ px: 2, py: 1.5 }}>
          <Alert severity="warning" sx={{ borderRadius: 1.5, fontSize: '0.8rem' }} icon={<ExclamationTriangleIcon />}>
            <AlertTitle sx={{ fontSize: '0.85rem' }}>Подозрительные публикации</AlertTitle>
            {suspiciousPosts.length} постов могут содержать фишинг
          </Alert>
        </Box>
      )}

      {}
      <Box sx={{ flex: 1, overflow: 'auto' }}>
        {}
        {activeTab === 'feed' && (
          <Box>
            {}
            {stories.length > 0 && (
              <Paper sx={{ mx: 0, borderRadius: 0, py: 2, borderBottom: '1px solid #DCE1E6' }}>
                <Box sx={{ display: 'flex', gap: 1.5, overflowX: 'auto', px: 2, pb: 0.5 }}>
                  <Box sx={{ textAlign: 'center', cursor: 'pointer', minWidth: 64 }}>
                    <Box sx={{ width: 56, height: 56, borderRadius: '50%', border: '2px dashed #99A2AD', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', bgcolor: '#F0F2F5' }}>
                      <PlusIcon style={{ fontSize: 20, color: '#99A2AD' }} />
                    </Box>
                    <Typography sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem', color: '#99A2AD' }}>Ваша история</Typography>
                  </Box>
                  {stories.map((story) => (
                    <Box key={story.id} onClick={() => { onAction('view_story', story); }} sx={{ textAlign: 'center', cursor: 'pointer', minWidth: 64 }}>
                      <Box sx={{ width: 56, height: 56, borderRadius: '50%', p: 0.5, border: story.isSuspicious ? '2px solid #FF9800' : story.viewed ? '2px solid #DCE1E6' : '2px solid #2787F5', mx: 'auto' }}>
                        <Avatar sx={{ width: '100%', height: '100%', bgcolor: story.isSuspicious ? '#FF9800' : '#2787F5', fontSize: '1.2rem' }}>{story.author.avatar}</Avatar>
                      </Box>
                      <Typography sx={{ display: 'block', mt: 0.5, fontSize: '0.65rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 64, color: story.isSuspicious ? '#FF9800' : '#626D7A' }}>
                        {story.author.name}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {}
            <Paper sx={{ mx: 0, borderRadius: 0, p: 2, borderBottom: '1px solid #DCE1E6' }}>
              <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: '#2787F5', borderRadius: '50%' }}>👤</Avatar>
                <Button
                  onClick={() => setShowNewPost(true)}
                  fullWidth
                  sx={{ justifyContent: 'flex-start', color: '#99A2AD', py: 1, px: 2, borderRadius: 2, bgcolor: '#F0F2F5', '&:hover': { bgcolor: '#E7E8EC' } }}
                >
                  <Typography>Что у вас нового?</Typography>
                </Button>
              </Box>
            </Paper>

            {}
            {posts.map((post) => (
              <Paper key={post.id} sx={{ mx: 0, borderRadius: 0, borderBottom: '1px solid #DCE1E6' }}>
                {post.isSponsored && (
                  <Box sx={{ px: 2, py: 0.5, bgcolor: '#F0F2F5' }}>
                    <Typography sx={{ color: '#99A2AD', fontSize: '0.7rem' }}>Реклама</Typography>
                  </Box>
                )}

                <Box sx={{ p: 2, pb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: post.author.isFake ? '#FF9800' : '#2787F5', borderRadius: '50%', fontSize: '1.2rem' }}>
                      {post.author.avatar}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <Typography sx={{ fontWeight: 600, color: '#2A5885' }}>{post.author.name}</Typography>
                        {post.author.isVerified && <CheckCircledIcon style={{ color: '#2787F5', fontSize: 16 }} />}
                        {post.author.isFake && (
                          <Chip label="Подозрительный" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#FFF3E0', color: '#E65100' }} />
                        )}
                      </Box>
                      <Typography sx={{ color: '#99A2AD', fontSize: '0.75rem' }}>{post.timestamp}{post.author.mutualFriends ? ` • ${post.author.mutualFriends} общих друзей` : ''}</Typography>
                    </Box>
                    <IconButton size="small"><DotsHorizontalIcon /></IconButton>
                  </Box>

                  <Typography sx={{ lineHeight: 1.6, mt: 1.5, mb: 1.5, whiteSpace: 'pre-line', color: '#222', fontSize: '0.9rem' }}>
                    {post.content}
                  </Typography>

                  {showWarnings && post.warnings && post.warnings.length > 0 && (
                    <Box sx={{ mb: 1.5 }}>
                      {post.warnings.map((w, idx) => (
                        <Alert key={idx} severity="warning" sx={{ mb: 0.5, borderRadius: 1.5, fontSize: '0.8rem' }}>
                          <Typography sx={{ fontSize: '0.75rem' }}>{w}</Typography>
                        </Alert>
                      ))}
                    </Box>
                  )}

                  {post.link && (
                    <Paper
                      variant="outlined"
                      onClick={() => handleLinkClick(post.link!.url, post.link!.isSuspicious)}
                      sx={{
                        p: 0,
                        mb: 1.5,
                        borderRadius: 1.5,
                        cursor: 'pointer',
                        overflow: 'hidden',
                        bgcolor: post.link.isSuspicious ? '#FFF8E1' : '#F0F2F5',
                        borderColor: post.link.isSuspicious ? '#FF9800' : '#DCE1E6',
                        '&:hover': { bgcolor: '#E7E8EC' },
                      }}
                    >
                      <Box sx={{ p: 1.5 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mb: 0.5 }}>
                          <Link2Icon style={{ color: post.link.isSuspicious ? '#FF9800' : '#2787F5', fontSize: 14 }} />
                          <Typography sx={{ color: '#99A2AD', fontSize: '0.75rem' }}>{post.link.url}</Typography>
                        </Box>
                        <Typography sx={{ fontWeight: 600, mb: 0.5, color: '#222', fontSize: '0.9rem' }}>{post.link.title}</Typography>
                        <Typography sx={{ color: '#626D7A', fontSize: '0.8rem' }}>{post.link.description}</Typography>
                        {post.link.isSuspicious && (
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 1, p: 1, bgcolor: '#FFF3E0', borderRadius: 1 }}>
                            <ExclamationTriangleIcon style={{ color: '#FF9800', fontSize: 14 }} />
                            <Typography sx={{ color: '#E65100', fontWeight: 500, fontSize: '0.75rem' }}>Подозрительная ссылка</Typography>
                          </Box>
                        )}
                      </Box>
                    </Paper>
                  )}
                </Box>

                {}
                <Box sx={{ px: 2, py: 0.5, display: 'flex', borderTop: '1px solid #DCE1E6' }}>
                  <Button size="small" sx={{ flex: 1, color: likedPosts.has(post.id) ? '#FF3347' : '#626D7A', justifyContent: 'flex-start', gap: 0.5 }} onClick={() => handleLike(post.id)}>
                    <span style={{ fontSize: 18 }}>{likedPosts.has(post.id) ? '❤️' : '🤍'}</span> {post.likes}
                  </Button>
                  <Button size="small" sx={{ flex: 1, color: '#626D7A', justifyContent: 'flex-start', gap: 0.5 }} onClick={() => handlePostClick(post)}>
                    <span style={{ fontSize: 18 }}>💬</span> {post.comments}
                  </Button>
                  <Button size="small" sx={{ flex: 1, color: '#626D7A', justifyContent: 'flex-start', gap: 0.5 }} onClick={() => { onAction('share_post', post.id); setShowAlert('shared'); setTimeout(() => setShowAlert(null), 2000); }}>
                    <Share1Icon style={{ fontSize: 18 }} /> {post.shares}
                  </Button>
                  <IconButton size="small"><BookmarkIcon style={{ fontSize: 18, color: '#626D7A' }} /></IconButton>
                </Box>
              </Paper>
            ))}
          </Box>
        )}

        {}
        {activeTab === 'stories' && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconButton size="small" onClick={() => setActiveTab('feed')}><ArrowLeftIcon /></IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Истории</Typography>
            </Box>
            {stories.map((story) => (
              <Paper key={story.id} sx={{ p: 2, mb: 1.5, borderRadius: 2, bgcolor: story.isSuspicious ? '#FFF8E1' : '#FFFFFF' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: story.isSuspicious ? '#FF9800' : '#2787F5', borderRadius: '50%', fontSize: '1.2rem' }}>{story.author.avatar}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#2A5885' }}>{story.author.name}</Typography>
                    <Typography sx={{ color: '#99A2AD', fontSize: '0.75rem' }}>{story.viewed ? 'Просмотрено' : 'Новое'}</Typography>
                  </Box>
                  {story.isSuspicious && <ExclamationTriangleIcon style={{ color: '#FF9800' }} />}
                </Box>
                <Typography sx={{ mb: 1.5, lineHeight: 1.6, fontSize: '0.9rem' }}>{story.content}</Typography>
                {story.hasLink && story.linkUrl && (
                  <Button size="small" onClick={() => handleLinkClick(story.linkUrl!, story.isSuspicious)} sx={{ borderRadius: 1.5, bgcolor: '#2787F5', color: 'white', '&:hover': { bgcolor: '#1E73D6' } }}>
                    Перейти по ссылке
                  </Button>
                )}
              </Paper>
            ))}
          </Box>
        )}

        {}
        {activeTab === 'messages' && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconButton size="small" onClick={() => setActiveTab('feed')}><ArrowLeftIcon /></IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Сообщения</Typography>
            </Box>
            {messages.map((msg) => (
              <Paper key={msg.id} sx={{ p: 2, mb: 1.5, borderRadius: 2, bgcolor: msg.isSuspicious ? '#FFF8E1' : '#FFFFFF' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1 }}>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: msg.sender.isFake ? '#FF9800' : '#2787F5', borderRadius: '50%', fontSize: '1.2rem' }}>{msg.sender.avatar}</Avatar>
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontWeight: 600, color: '#2A5885' }}>{msg.sender.name}</Typography>
                    <Typography sx={{ color: '#99A2AD', fontSize: '0.75rem' }}>{msg.timestamp}</Typography>
                  </Box>
                  {msg.isSuspicious && <ExclamationTriangleIcon style={{ color: '#FF9800' }} />}
                </Box>
                <Typography sx={{ mb: 1.5, lineHeight: 1.6, fontSize: '0.9rem' }}>{msg.text}</Typography>
                {msg.hasLink && msg.linkUrl && (
                  <Button size="small" onClick={() => handleLinkClick(msg.linkUrl!, msg.isSuspicious)} sx={{ borderRadius: 1.5 }}>
                    <Link2Icon style={{ marginRight: 4, fontSize: 14 }} /> {msg.linkUrl}
                  </Button>
                )}
              </Paper>
            ))}
          </Box>
        )}

        {}
        {activeTab === 'profile' && (
          <Box sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <IconButton size="small" onClick={() => setActiveTab('feed')}><ArrowLeftIcon /></IconButton>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem' }}>Моя страница</Typography>
            </Box>
            <Paper sx={{ p: 3, borderRadius: 2, textAlign: 'center', mb: 2 }}>
              <Avatar sx={{ width: 88, height: 88, mx: 'auto', mb: 1.5, bgcolor: '#2787F5', fontSize: '2.2rem', borderRadius: '50%' }}>👤</Avatar>
              <Typography sx={{ fontWeight: 700, fontSize: '1.2rem', color: '#2A5885' }}>Иван Иванов</Typography>
              <Typography sx={{ color: '#99A2AD', fontSize: '0.85rem' }}>@ivanov</Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 1, mt: 2 }}>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#222' }}>156</Typography>
                  <Typography sx={{ color: '#99A2AD', fontSize: '0.75rem' }}>Друзья</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#222' }}>42</Typography>
                  <Typography sx={{ color: '#99A2AD', fontSize: '0.75rem' }}>Посты</Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontWeight: 700, fontSize: '1.1rem', color: '#222' }}>1.2K</Typography>
                  <Typography sx={{ color: '#99A2AD', fontSize: '0.75rem' }}>Подписчики</Typography>
                </Box>
              </Box>
            </Paper>

            <Typography sx={{ fontWeight: 700, mb: 1.5, color: '#222', fontSize: '1rem' }}>Настройки безопасности</Typography>
            <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
              {[
                { icon: '🔒', title: 'Приватность', desc: 'Только друзья' },
                { icon: '✅', title: 'Двухфакторная аутентификация', desc: 'Включена' },
                { icon: '📱', title: 'Активные сессии', desc: '2 устройства' },
                { icon: '🚫', title: 'Чёрный список', desc: '5 пользователей' },
              ].map((item, idx) => (
                <Box key={item.title}>
                  <Box sx={{ px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', '&:hover': { bgcolor: '#F0F2F5' } }}>
                    <span style={{ fontSize: 20 }}>{item.icon}</span>
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontWeight: 500, fontSize: '0.9rem' }}>{item.title}</Typography>
                      <Typography sx={{ color: '#99A2AD', fontSize: '0.75rem' }}>{item.desc}</Typography>
                    </Box>
                  </Box>
                  {idx < 3 && <Divider />}
                </Box>
              ))}
            </Paper>
          </Box>
        )}
      </Box>

      {}
      <Box sx={{ bgcolor: '#FFFFFF', borderTop: '1px solid #DCE1E6', display: 'flex' }}>
        {[
          { value: 'feed' as TabValue, icon: '📰', label: 'Новости' },
          { value: 'stories' as TabValue, icon: '⭕', label: 'Истории' },
          { value: 'messages' as TabValue, icon: '💬', label: 'Чаты' },
          { value: 'profile' as TabValue, icon: '👤', label: 'Профиль' },
        ].map((tab) => (
          <Button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            sx={{ flex: 1, flexDirection: 'column', py: 1, color: activeTab === tab.value ? '#2787F5' : '#99A2AD', borderRadius: 0, minWidth: 0 }}
          >
            <span style={{ fontSize: 22 }}>{tab.icon}</span>
            <Typography sx={{ fontSize: '0.65rem', mt: 0.25, fontWeight: activeTab === tab.value ? 600 : 400 }}>{tab.label}</Typography>
          </Button>
        ))}
      </Box>

      {}
      <Dialog open={showPostDetails} onClose={() => setShowPostDetails(false)} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 2 } }}>
        {selectedPost && (
          <>
            <DialogTitle sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1 }}>
              {selectedPost.isPhishing ? <ExclamationTriangleIcon style={{ color: '#FF9800' }} /> : <CheckCircledIcon style={{ color: '#4CAF50' }} />}
              Детали публикации
            </DialogTitle>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, py: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: selectedPost.author.isFake ? '#FF9800' : '#2787F5', borderRadius: '50%', fontSize: '1.2rem' }}>{selectedPost.author.avatar}</Avatar>
                  <Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography sx={{ fontWeight: 600, color: '#2A5885' }}>{selectedPost.author.name}</Typography>
                      {selectedPost.author.isFake && <Chip label="Подозрительный" size="small" sx={{ height: 18, fontSize: '0.6rem', bgcolor: '#FFF3E0', color: '#E65100' }} />}
                    </Box>
                    <Typography sx={{ color: '#99A2AD', fontSize: '0.75rem' }}>{selectedPost.timestamp}</Typography>
                  </Box>
                </Box>
                <Typography sx={{ lineHeight: 1.6, whiteSpace: 'pre-line', fontSize: '0.9rem' }}>{selectedPost.content}</Typography>
                {selectedPost.link && (
                  <Paper sx={{ p: 1.5, bgcolor: selectedPost.link.isSuspicious ? '#FFF8E1' : '#F0F2F5', borderRadius: 1.5 }}>
                    <Typography sx={{ fontWeight: 600, mb: 0.5, fontSize: '0.9rem' }}>{selectedPost.link.title}</Typography>
                    <Typography sx={{ color: '#99A2AD', fontFamily: 'monospace', fontSize: '0.8rem' }}>{selectedPost.link.url}</Typography>
                    {selectedPost.link.isSuspicious && (
                      <Alert severity="warning" sx={{ mt: 1, borderRadius: 1.5 }}>
                        <Typography sx={{ fontSize: '0.75rem' }}>Подозрительная ссылка! Не переходите по ней.</Typography>
                      </Alert>
                    )}
                  </Paper>
                )}
                {selectedPost.warnings && selectedPost.warnings.length > 0 && (
                  <Alert severity="warning" sx={{ borderRadius: 1.5 }}>
                    {selectedPost.warnings.map((w, idx) => (
                      <Typography key={idx} sx={{ display: 'block', fontSize: '0.75rem' }}>{w}</Typography>
                    ))}
                  </Alert>
                )}
              </Box>
            </DialogContent>
            <DialogActions sx={{ px: 3, pb: 2 }}>
              <Button onClick={() => setShowPostDetails(false)}>Закрыть</Button>
              <Button onClick={() => handleReportPost(selectedPost.id)} color="error" variant="outlined" sx={{ borderRadius: 1.5 }}>Пожаловаться</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {}
      <Dialog open={showNewPost} onClose={() => setShowNewPost(false)} PaperProps={{ sx: { borderRadius: 2 } }}>
        <DialogTitle sx={{ fontWeight: 700 }}>Новая запись</DialogTitle>
        <DialogContent>
          <TextField
            value={newPostText}
            onChange={(e) => setNewPostText(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Что у вас нового?"
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 1.5 } }}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setShowNewPost(false)}>Отмена</Button>
          <Button onClick={handleNewPost} variant="contained" sx={{ borderRadius: 1.5, bgcolor: '#2787F5' }}>Опубликовать</Button>
        </DialogActions>
      </Dialog>

      {}
      {showAlert && (
        <Box sx={{ position: 'absolute', bottom: 70, left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
          <Alert severity={showAlert === 'suspicious_link' ? 'warning' : 'success'} sx={{ borderRadius: 1.5, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {showAlert === 'suspicious_link' && '⚠️ Подозрительная ссылка!'}
            {showAlert === 'reported' && '✅ Жалоба отправлена'}
            {showAlert === 'shared' && '📤 Пост поделён'}
            {showAlert === 'post_created' && '✅ Пост опубликован'}
          </Alert>
        </Box>
      )}
    </Paper>
  );
}
