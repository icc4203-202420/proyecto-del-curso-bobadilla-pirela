class EventPicture < ApplicationRecord
  belongs_to :event
  belongs_to :user
  has_one_attached :picture

  def url
    picture.attached? ? Rails.application.routes.url_helpers.rails_blob_url(picture, only_path: true) : nil
  end
end
