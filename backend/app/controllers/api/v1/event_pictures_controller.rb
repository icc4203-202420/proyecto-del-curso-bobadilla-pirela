class API::V1::EventPicturesController < ApplicationController
  before_action :set_event_picture, only: [:show, :update, :destroy]
  before_action :authenticate_user_from_token!

  # GET /api/v1/event_pictures
  def index
    @event_pictures = EventPicture.all
    render json: EventPictureSerializer.new(@event_pictures).serializable_hash, status: :ok
  end

  # GET /api/v1/event_pictures/:id
  def show
    render json: @event_picture, status: :ok
  end

  # POST /api/v1/event_pictures
  def create
    @event_picture = EventPicture.new(event_picture_params.except(:user_ids).merge(user_id: @current_user.id)) # Excluye user_ids de los parámetros
    puts(2)
    if @event_picture.save
      params[:event_picture][:user_ids].each do |user_id|
        EventPicturesUser.create(event_picture: @event_picture, user_id: user_id)
      end
      render json: @event_picture, status: :created
    else
      render json: @event_picture.errors, status: :unprocessable_entity
    end
  end

  # PATCH/PUT /api/v1/event_pictures/:id
  def update
    if @event_picture.update(event_picture_params.except(:user_ids))
      render json: { message: 'Picture updated successfully', event_picture: @event_picture }, status: :ok
    else
      render json: { errors: @event_picture.errors.full_messages }, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/event_pictures/:id
  def destroy
    @event_picture.destroy
    render json: { message: 'Picture deleted successfully' }, status: :ok
  end

  private

  def set_event_picture
    @event_picture = EventPicture.find(params[:id])
  rescue ActiveRecord::RecordNotFound
    render json: { errors: 'Event picture not found' }, status: :not_found
  end

  def event_picture_params
    params.require(:event_picture).permit(:event_id, :description, :picture, user_ids: [])
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
