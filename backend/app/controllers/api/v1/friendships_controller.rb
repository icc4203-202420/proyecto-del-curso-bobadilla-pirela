class API::V1::FriendshipsController < ApplicationController
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
  
    private
  
    def set_user
      @user = User.find(params[:user_id])
    end
  
    def friendship_params
      params.require(:friendship).permit(:friend_id, :bar_id)
    end
  end
  