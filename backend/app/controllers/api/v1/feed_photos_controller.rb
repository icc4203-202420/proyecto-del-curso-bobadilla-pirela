class FeedPhotosController < ApplicationController
    # GET /feed_photos
    def index
      @feed_photos = FeedPhoto.all
      render json: @feed_photos, status: :ok
    end
  end
  