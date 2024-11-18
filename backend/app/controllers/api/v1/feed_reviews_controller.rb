class API::V1::FeedReviewsController < ApplicationController
    # GET /feed_reviews
    def index
      @feed_reviews = FeedReview.all
  
      render json: @feed_reviews, status: :ok
    end
  end
  