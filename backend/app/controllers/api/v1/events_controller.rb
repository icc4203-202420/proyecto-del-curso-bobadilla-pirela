class API::V1::EventsController < ApplicationController
  include ImageProcessing
  include Authenticable

  respond_to :json
  before_action :set_bar, only: [:index]
  before_action :set_event, only: [:show, :update, :destroy]
  before_action :verify_jwt_token, only: [:create, :update, :destroy]

  # GET /api/v1/bars/:bar_id/events
  def index
    if @bar
      @events = @bar.events

      if @bar.image.attached?
        render json: @bar.as_json(
          include: { 
            address: { only: [:line1, :line2, :city, :country] },
            events: { only: [:id, :name, :date] }
          }
        ).merge({
          image_url: url_for(@bar.image),
          thumbnail_url: url_for(@bar.thumbnail)
        }), status: :ok
      else
        render json: @bar.as_json(
          include: { 
            address: { only: [:line1, :line2, :city, :country] },
            events: { only: [:id, :name, :date] }
          }
        ), status: :ok
      end
    end
  end

  # GET /api/v1/bars/:bar_id/events/:id
  def show
    if @event
      attendees = @event.attendances.includes(:user).map do |attendance|
        {
          id: attendance.id,
          first_name: attendance.user.first_name,
          last_name: attendance.user.last_name
        }
      end
  
      render json: {
        event: @event.as_json(only: [:id, :name, :description, :date, :start_date, :end_date]),
        bar: @event.bar.as_json(only: [:id, :name]),
        attendees: attendees
      }, status: :ok
    else
      render json: { error: 'Event not found' }, status: :not_found
    end
  end

  # POST /api/v1/events
  def create
    @event = Event.new(event_params.except(:image_base64))
    handle_image_attachment if event_params[:image_base64]

    if @event.save
      render json: { event: @event, message: 'Event created successfully.' }, status: :created
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  # PATCH /api/v1/events/:id
  def update
    handle_image_attachment if event_params[:image_base64]

    if @event.update(event_params.except(:image_base64))
      render json: { event: @event, message: 'Event updated successfully.' }, status: :ok
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end

  # DELETE /api/v1/events/:id
  def destroy
    if @event.destroy
      render json: { message: 'Event successfully deleted.' }, status: :no_content
    else
      render json: @event.errors, status: :unprocessable_entity
    end
  end
  
  def create_video
    event = Event.find(params[:id])
    photo_urls = event.event_pictures.map { |picture| picture.url if picture.picture.attached? }.compact
  
    if photo_urls.any?
      CreateVideoJob.perform_later(event.id, photo_urls)
      render json: { message: "Video creation started for event #{event.id}" }, status: :accepted
    else
      render json: { error: "No images found for event #{event.id}" }, status: :unprocessable_entity
    end
  end  

  def get_video
    event = Event.find(params[:id])
    if event.video.attached?
      video_url = url_for(event.video)
      render json: { video_url: video_url}
    else
      render json: { message: "Video is not available."}, status: :not_found
    end
  end

  private

  # Use callbacks to share common setup or constraints between actions.

  def set_bar
    @bar = Bar.find_by(id: params[:bar_id])
    render json: { error: 'Bar not found' }, status: :not_found unless @bar
  end

  def set_event
    @event = Event.find_by(id: params[:id])
    render json: { error: 'Event not found' }, status: :not_found unless @event
  end

  def event_params
    params.require(:event).permit(
      :name, :description, :date, :location, :image_base64, :start_date, :end_date, :bar_id
    )
  end

  def handle_image_attachment
    decoded_image = decode_image(event_params[:image_base64])
    @event.image.attach(io: decoded_image[:io], filename: decoded_image[:filename], content_type: decoded_image[:content_type])
  end
end