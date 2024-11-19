class API::V1::UsersController < ApplicationController
  before_action :authenticate_user_from_token!
  before_action :authenticate_user!, only: [:update]
  
  respond_to :json
  before_action :set_user, only: [:show, :update, :friendships]
  
  def index
    users = User.where.not(id: current_user.id).select(:id, :handle)
    
    render json: { users: users, current_user: { id: current_user.id } }
  end

  def show
    if @user
      render json: {
        handle: @user.handle,
        first_name: @user.first_name,
        last_name: @user.last_name,
      }, status: :ok
    else
      render json: { error: 'User not found' }, status: :not_found
    end
  end
  

  def create
    @user = User.new(user_params)
    @user.push_token = params[:push_token] if params[:push_token].present?

    if @user.save
      token = @user.generate_jwt
      render json: { id: @user.id, token: token, push_token: @user.push_token }, status: :ok
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def update
    if params[:push_token].present?
      @user.push_token = params[:push_token]
    end
  
    if @user.update(user_params)
      render :show, status: :ok, location: api_v1_users_path(@user)
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def friendships
  
  end

  #def generate_jwt
  #  JWT.encode({ sub: id }, Rails.application.credentials.devise_jwt_secret_key, 'HS256')
  #end

  private

  def set_user
    @user = User.find(params[:id])
  end

  def user_params
    params.fetch(:user, {}).permit(
      :id, :first_name, :last_name, :email, :age, :handle, :push_token,
      address_attributes: [:id, :line1, :line2, :city, :country, :country_id, 
                           country_attributes: [:id, :name]],
      reviews_attributes: [:id, :text, :rating, :beer_id, :_destroy]
    )
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