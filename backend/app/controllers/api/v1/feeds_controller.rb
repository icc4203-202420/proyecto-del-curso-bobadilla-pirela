class API::V1::FeedsController < ApplicationController
  before_action :authenticate_user_from_token!

  # GET /api/v1/feed
  def index
    friend_ids = current_user.friends.pluck(:id)
    feed_photos = FeedPhoto.where(user_id: [*friend_ids, current_user.id]).order(created_at: :desc).limit(50)
    feed_reviews = FeedReview.where(user_id: [*friend_ids, current_user.id]).order(created_at: :desc).limit(50)
    combined_feed = (feed_photos + feed_reviews).sort_by(&:created_at).reverse

    render json: combined_feed, status: :ok
  end

  private

  def authenticate_user_from_token!
    token = request.headers['Authorization']&.split(' ')&.last
    return head :unauthorized unless token

    begin
      decoded_token = JWT.decode(token, Rails.application.credentials.devise_jwt_secret_key, true, algorithm: 'HS256')
      payload = decoded_token.first
      @current_user = User.find(payload['sub'])
    rescue JWT::DecodeError, JWT::ExpiredSignature => e
      Rails.logger.error "JWT Error: #{e.message}"
      head :unauthorized
    end
  end
end
