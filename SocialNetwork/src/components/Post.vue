<template>
  <div class="post">
    <div class="post-header">
      <img 
        :src="post.user.profilePicture || 'https://via.placeholder.com/30?text=User'" 
        :alt="`${post.user.name || 'User'}'s profile picture`" 
        class="profile-picture" 
        @error="handleImageError"
      />
      <span class="user-name">{{ post.user.name || 'Unknown User' }}</span>
    </div>
    <p>{{ post.content }}</p>
    <img v-if="post.image" :src="post.image" alt="Post image" class="post-image" />
    <small>{{ post.createdAt }}</small>
    <div class="comments">
      <input 
        v-model="newComment" 
        placeholder="Add a comment" 
        @keyup.enter="addComment" 
        aria-label="Add a comment"
      />
      <button @click="addComment">Comment</button>
      <div v-for="(comment, index) in post.comments" :key="index">
        <p>
          <strong>{{ comment.user }}</strong>: {{ comment.content }} 
          <small>{{ comment.createdAt }}</small>
        </p>
      </div>
    </div>
    <button @click="deletePost">Delete Post</button>
  </div>
</template>

<script>
export default {
  props: {
    post: {
      type: Object,
      required: true,
      validator: (post) => post.user && typeof post.user === 'object',
    },
    user: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      newComment: '',
    };
  },
  mounted() {
    console.log('Post rendered:', {
      postId: this.post.id,
      userName: this.post.user.name,
      profilePicture: this.post.user.profilePicture ? this.post.user.profilePicture.slice(0, 50) + '...' : 'No picture',
      hasPicture: !!this.post.user.profilePicture,
      srcUsed: this.post.user.profilePicture || 'https://via.placeholder.com/30?text=User',
    });
  },
  methods: {
    addComment() {
      if (this.newComment) {
        this.$emit('add-comment', this.post.id, this.newComment);
        this.newComment = '';
        console.log('Comment added:', this.newComment);
      } else {
        alert('Please enter a comment before submitting.');
      }
    },
    deletePost() {
      this.$emit('delete-post', this.post.id);
      console.log('Delete post triggered:', this.post.id);
    },
    handleImageError() {
      console.warn('Profile picture failed to load for post:', this.post.id, 'URL:', this.post.user.profilePicture);
    },
  },
};
</script>

<style scoped>
.post {
  border: 1px solid var(--primary-color, magenta);
  padding: 10px;
  margin-bottom: 10px;
  background-color: var(--background-color, black);
  color: var(--text-color, magenta);
  transition: transform 0.3s ease;
}

.post:hover {
  transform: scale(1.02);
}

.post-header {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
}

.profile-picture {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  margin-right: 10px;
  border: 2px solid var(--primary-color, magenta);
  object-fit: cover;
}

.user-name {
  font-weight: bold;
  color: var(--text-color, magenta);
}

.post-image {
  max-width: 100%;
  height: auto;
}

small {
  color: var(--text-color, magenta);
}

.comments {
  margin-top: 10px;
  background-color: var(--background-color, black);
}

.comments input {
  color: var(--text-color, magenta);
  background-color: var(--background-color, black);
  border: 1px solid var(--primary-color, magenta);
  padding: 10px;
  margin: 5px 0;
  border-radius: 5px;
  transition: border-color 0.3s ease;
}

.comments input:focus {
  border-color: var(--primary-color, magenta);
}

.comments button {
  background-color: var(--primary-color, magenta);
  color: var(--text-color, black);
  transition: background-color 0.3s ease, transform 0.2s ease;
  padding: 10px;
  border: none;
  border-radius: 5px;
}

.comments button:hover {
  background-color: #e0e0e0;
  transform: scale(1.05);
}
</style>