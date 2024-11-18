# app/models/feed.rb
class Feed < ApplicationRecord
  belongs_to :user
  belongs_to :beer  # Relación con el modelo Beer

  validates :beer, presence: true  # Validación para asegurarse de que siempre haya una cerveza asociada
end
