class API::V1::ReviewsController < ApplicationController
  respond_to :json
  before_action :set_user, only: [:index, :create]
  before_action :set_review, only: [:show, :update, :destroy]
  before_action :authenticate_user_from_token!
  before_action :set_beer, only: [:index]

  def index
    if @beer
      all_reviews = Review.where(beer: @beer)
    elsif @user
      all_reviews = Review.where(user: @user)
    else
      all_reviews = Review.all
    end
  
    user_reviews = all_reviews.where(user: current_user)
    other_reviews = all_reviews.where.not(user: current_user)
  
    sorted_reviews = user_reviews + other_reviews
  
    render json: {
      reviews: sorted_reviews.as_json(include: {
        user: { only: [:handle] }
      })
    }, status: :ok
  end

  def show
    if @review
      render json: { review: @review }, status: :ok
    else
      render json: { error: "Review not found" }, status: :not_found
    end
  end

  def create
    if current_user
      review = current_user.reviews.new(review_params.merge(beer_id: params[:beer_id]))

      if review.save
        ActionCable.server.broadcast(
        "feed_#{current_user.id}",
        {
          user: current_user.id,
          handle: review.user.handle,
          beer_name: review.beer.name,
          rating: review.rating,
          beer_id: review.beer.id,
          type: "feed_review",
        }
        );
        bar = BarsBeer.joins(:bar).where(beer_id: review.beer.id).first&.bar
        FeedReview.create!(
          user: current_user,
          rating: review.rating,
          rating_global: review.beer.avg_rating,
          text: review.text,
          beer_name: review.beer.name,
          bar_name: bar&.name || '',
          country_name: bar&.address&.country&.name || '',
          bar: bar
        )
        render json: { status: 200, message: 'Review created successfully.', review: review }, status: :ok
      else
        render json: { error: 'Failed to create review.' }, status: :unprocessable_entity
      end
    else
      render json: { error: 'Unauthorized' }, status: :unauthorized
    end
  end

  def update
    if @review.update(review_params)
      render json: @review, status: :ok
    else
      render json: @review.errors, status: :unprocessable_entity
    end
  end

  def destroy
    @review.destroy
    head :no_content
  end

  private

  def set_review
    @review = Review.find_by(id: params[:id])
    render json: { error: "Review not found" }, status: :not_found unless @review
  end

  def current_user
    @current_user
  end

  def set_user
    @user = current_user
  end

  def set_beer
    @beer = Beer.find_by(id: params[:beer_id])
    render json: { error: "Beer not found" }, status: :not_found unless @beer
  end

  def review_params
    params.require(:review).permit(:rating, :text)
  end

  def authenticate_user_from_token!
    token = request.headers['Authorization']&.split(' ')&.last
    return head :unauthorized unless token

    begin
      decoded_token = JWT.decode(token, Rails.application.credentials.devise_jwt_secret_key, true, algorithm: 'HS256')
      payload = decoded_token.first
      @current_user = User.find(payload['sub'])
    rescue JWT::DecodeError, JWT::ExpiredSignature
      head :unauthorized
    end
  end
end
