class FeedChannel < ApplicationCable::Channel
  def subscribed
    stream_from "feed_#{params[:user_id]}"
    Rails.logger.info "Usuario suscrito al canal feed_#{params[:user_id]}"
  end

  def unsubscribed
    stop_all_streams
  end

  def receive(data)
    ActionCable.server.broadcast "feed_#{params[:user_id]}", data
  end
end
