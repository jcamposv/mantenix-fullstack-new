export interface CommentWithAuthor {
  id: string
  content: string
  createdAt: Date
  alertId: string
  authorId: string
  author: {
    id: string
    name: string
    email: string
    role: string
  }
}

export interface CreateCommentData {
  content: string
  alertId: string
  authorId: string
}