class EventPictureSerializer
  include JSONAPI::Serializer
  
  attributes :id, :description, :created_at, :updated_at
  
  attribute :url do |object|
    object.picture.url if object.picture.attached?
  end
end