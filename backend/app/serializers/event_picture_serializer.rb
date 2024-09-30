class EventPictureSerializer
  include JSONAPI::Serializer

  attributes :id, :description, :created_at, :updated_at
  
  attribute :url do |object|
    object.picture.url if object.picture.attached?
  end

  attribute :tagged_users do |object|
    object.event_pictures_users.map do |event_picture_user|
      {
        id: event_picture_user.user.id,
        handle: event_picture_user.user.handle
      }
    end
  end
end