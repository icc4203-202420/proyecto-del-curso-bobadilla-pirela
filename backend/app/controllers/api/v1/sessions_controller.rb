class API::V1::SessionsController < Devise::SessionsController
  include ::RackSessionsFix
  respond_to :json

  # Método para manejar el inicio de sesión
  def create
    puts(params)
    user = User.find_by(email: params[:user][:email])

    # Verificar si se encontró un usuario con ese correo
    if user && user.valid_password?(params[:user][:password])
      if params[:user][:push_token].present?
        user.update(push_token: params[:user][:push_token])
      end
      token = encode_token({ sub: user.id })
      Rails.logger.debug("Generated token: #{token}")  # Agrega esta línea para depurar
      
      render json: {
        status: { 
          code: 200, message: 'Logged in successfully.',
          data: { user: UserSerializer.new(user).serializable_hash[:data][:attributes] },
          token: token
        }
      }, status: :ok
    else
      Rails.logger.debug("Login2 failed for user: #{params[:user][:email]}")  # Agrega esta línea para depurar

      render json: { status: 401, message: 'Invalid email or password.' }, status: :unauthorized
    end
  end

  # Método para manejar el cierre de sesión
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
    jti = SecureRandom.uuid
    payload[:jti] = jti
    payload[:scope] = 'user'
    JWT.encode(payload, Rails.application.credentials.devise_jwt_secret_key, 'HS256')
  end
end
