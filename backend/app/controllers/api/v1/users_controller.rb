class API::V1::UsersController < ApplicationController
  include Authenticable
  before_action :authenticate_user!, only: [:update]
  
  respond_to :json
  before_action :set_user, only: [:show, :update, :friendships]
  
  def index
    @users = User.includes(:reviews, :address).all   
  end

  def show
  
  end

  def create
    @user = User.new(user_params)
    if @user.save
      token = @user.generate_jwt
      render json: { id: @user.id, token: token }, status: :ok
    else
      render json: @user.errors, status: :unprocessable_entity
    end
  end

  def update
    #byebug
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
    params.fetch(:user, {}).
        permit(:id, :first_name, :last_name, :email, :age, :handle,
            { address_attributes: [:id, :line1, :line2, :city, :country, :country_id, 
              country_attributes: [:id, :name]],
              reviews_attributes: [:id, :text, :rating, :beer_id, :_destroy]
            })
  end

end