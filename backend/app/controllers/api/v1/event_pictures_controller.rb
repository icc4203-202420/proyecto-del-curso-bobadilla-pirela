class API::V1::EventPicturesController < ApplicationController
    before_action :set_event_picture, only: [:show, :update, :destroy]
  
    # GET /api/v1/event_pictures
    def index
      @event_pictures = EventPicture.all
      render json: @event_pictures, status: :ok
    end
  
    # GET /api/v1/event_pictures/:id
    def show
      render json: @event_picture, status: :ok
    end
  
    # POST /api/v1/event_pictures
    def create
      @event_picture = EventPicture.new(event_picture_params)
  
      if @event_picture.save
        render json: { message: 'Picture uploaded successfully', event_picture: @event_picture }, status: :created
      else
        render json: { errors: @event_picture.errors.full_messages }, status: :unprocessable_entity
      end
    end
  
    # PATCH/PUT /api/v1/event_pictures/:id
    def update
      if @event_picture.update(event_picture_params)
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
      params.require(:event_picture).permit(:event_id, :user_id, :description, :picture)
    end
  end
  