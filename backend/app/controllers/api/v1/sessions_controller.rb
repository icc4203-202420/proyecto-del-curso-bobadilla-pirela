class API::V1::SessionsController < Devise::SessionsController
  include ::RackSessionsFix
  respond_to :json
  private
  def respond_with(current_user, _opts = {})
    token = encode_token({ sub: resource.id })
    render json: {
      status: { 
        code: 200, message: 'Logged in successfully.',
        data: { user: UserSerializer.new(current_user).serializable_hash[:data][:attributes] },
        token: token
      }
    }, status: :ok

  end
  def respond_to_on_destroy
    if request.headers['Authorization'].present?
      jwt_payload = JWT.decode(
        request.headers['Authorization'].split(' ').last,
        Rails.application.credentials.devise_jwt_secret_key,
        true,
        { algorithm: 'HS256' }
      ).first
      current_user = User.find(jwt_payload['sub'])
    end
    
    if current_user
      render json: {
        status: 200,
        message: 'Logged out successfully.'
      }, status: :ok
    else
      render json: {
        status: 401,
        message: "Couldn't find an active session."
      }, status: :unauthorized
    end
  end

  private

  def encode_token(payload)
    JWT.encode(payload, Rails.application.credentials.devise_jwt_secret_key, 'HS256')
  end
end
