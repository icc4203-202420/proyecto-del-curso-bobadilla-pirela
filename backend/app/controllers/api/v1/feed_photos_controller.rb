class API::V1::FeedPhotosController < ApplicationController
  # GET /feed_photos
  def index
    @feed_photos = FeedPhoto.order(created_at: :desc)
    render json: @feed_photos, status: :ok
  end
end
  