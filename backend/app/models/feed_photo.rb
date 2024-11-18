class FeedPhoto < ApplicationRecord
    belongs_to :event_picture
    belongs_to :event
  
    # Si también deseas acceder a la URL de la imagen desde FeedPicture
    def picture_url
      event_picture.picture.attached? ? Rails.application.routes.url_helpers.rails_blob_url(event_picture.picture, only_path: true) : nil
    end
end
  