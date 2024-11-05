class API::V1::FriendshipsController < ApplicationController
  before_action :authenticate_user_from_token!

  before_action :set_user

  def index
    friendships = @user.friendships.includes(:friend, :bar)
    render json: friendships.as_json(include: { friend: { only: [:id, :name, :email] }, bar: { only: [:id, :name] } }), status: :ok
  end

  def create
    friendship = @user.friendships.build(friendship_params)
    if friendship.save
      render json: friendship, status: :created
    else
      render json: friendship.errors, status: :unprocessable_entity
    end
  end

  def destroy
    friendship = current_user.friendships.find_by(friend_id: params[:id])
    if friendship
      friendship.destroy
      render json: { message: 'Friendship removed successfully' }, status: :ok
    else
      render json: { error: 'Friendship not found' }, status: :not_found
    end
  end

  private

  def set_user
    @user = User.find(params[:user_id])
  end

  def friendship_params
    params.require(:friendship).permit(:friend_id, :bar_id, :event_id)
  end

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
