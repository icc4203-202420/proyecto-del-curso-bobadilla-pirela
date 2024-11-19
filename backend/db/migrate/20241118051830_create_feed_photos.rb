class CreateFeedPhotos < ActiveRecord::Migration[6.0]
  def change
    create_table :feed_photos do |t|
      t.string :description
      t.string :bar_name
      t.string :country_name
      t.string :event_name
      t.references :event, null: false, foreign_key: true
      t.references :bar, null: false, foreign_key: true
      t.references :user, null: false, foreign_key: true
      t.references :event_picture, null: false, foreign_key: true

      t.timestamps
    end
  end
end
