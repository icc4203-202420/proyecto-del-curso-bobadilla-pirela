class API::V1::FeedsController < ApplicationController
  # GET /api/v1/feed
  def index
    feed_photos = FeedPhoto.order(created_at: :desc)
    feed_reviews = FeedReview.order(created_at: :desc)

    combined_feed = (feed_photos + feed_reviews).sort_by(&:created_at).reverse

    render json: combined_feed, status: :ok
  end
end