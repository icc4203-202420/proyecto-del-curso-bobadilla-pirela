class FeedPhoto < ApplicationRecord
  belongs_to :user
  belongs_to :event
  belongs_to :event_picture

  # Validaciones
  validates :description, presence: true
  validates :bar_name, presence: true
  validates :country_name, presence: true
  validates :event_name, presence: true

  # Método para obtener la URL de la imagen
  def picture_url
    event_picture.picture.attached? ? Rails.application.routes.url_helpers.rails_blob_url(event_picture.picture, only_path: true) : nil
  end
end
