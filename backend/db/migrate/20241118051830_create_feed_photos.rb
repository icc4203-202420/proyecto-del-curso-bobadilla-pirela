class CreateFeedPhotos < ActiveRecord::Migration[6.0]
  def change
    create_table :feed_photos do |t|
      t.string :description
      t.integer :event_picture_id, null: false, foreign_key: true
      t.string :event_name
      t.string :bar_name
      t.string :country_name
      t.integer :event_id, null: false, foreign_key: true
      t.integer :user_id, null: false, foreign_key: true

      t.timestamps
    end
  end
end
