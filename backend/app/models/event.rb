class Event < ApplicationRecord
  belongs_to :bar
  has_many :attendances
  has_many :users, through: :attendances
  has_many :attendees, through: :attendances, source: :user

  has_one_attached :flyer

  validates :flyer, content_type: { in: ['image/png', 'image/jpg', 'image/jpeg'],
                                    message: 'must be a valid image format' },
                    size: { less_than: 5.megabytes }

  def thumbnail
    flyer.variant(resize_to_limit: [200, nil]).processed
  end  
end
