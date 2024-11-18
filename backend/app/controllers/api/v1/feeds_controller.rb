class API::V1::FeedsController < ApplicationController
  def index
    @feeds = Feed.all
    render json: @feeds
  end
end
