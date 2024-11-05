class API::V1::AttendancesController < ApplicationController
  before_action :set_event, only: [:show, :create, :destroy]
  before_action :authenticate_user_from_token!

  def create
    @attendance = @event.attendances.find_or_initialize_by(user: current_user)
    if @attendance.update(checked_in: true)
      if current_user.push_token.present?
        # DEBUG
        NotificationService.send_notification(
          to: current_user.push_token,
          title: "Has confirmado tu asistencia al evento!",
          body: "Estaremos esperándote en el evento #{@event.name}.",
          data: {}
        )
      end
      friends = current_user.friends
      friends.each do |friend|
        next unless friend.push_token.present? 
        NotificationService.send_notification(
          to: friend.push_token,
          title: "#{current_user.handle} has checked in to an event!",
          body: "#{current_user.handle} has decided to attend the event: #{@event.name}.",
          data: { event_id: @event.id }
        )
      end
      render json: { status: 'success', attendance: @attendance }, status: :ok
    else
      render json: { status: 'error', message: @attendance.errors.full_messages }, status: :unprocessable_entity
    end
  end

  def show
    @attendance = @event.attendances.find_by(user: current_user)
    if @attendance
      render json: { checked_in: @attendance.checked_in }, status: :ok
    else
      render json: { checked_in: false }, status: :ok
    end
  end

  def destroy
    @attendance = @event.attendances.find_by(user: current_user)
    if @attendance&.destroy
      render json: { status: 'success' }, status: :ok
    else
      render json: { status: 'error', message: 'Unable to cancel attendance' }, status: :unprocessable_entity
    end
  end

  def attendees
    event = Event.find_by(id: params[:id])
  
    if event
      attendees = event.attendances.map(&:user)
      current_user_friends = current_user.friends.pluck(:friend_id)
      puts(current_user_friends)
      attendees_with_status = attendees.map do |user|
        {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          handle: user.handle,
          is_friend: current_user_friends.include?(user.id)
        }
      end
      render json: attendees_with_status
    else
      render json: { error: 'Event not found' }, status: :not_found
    end
  end

  private

  def set_event
    @event = Event.find(params[:event_id])
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