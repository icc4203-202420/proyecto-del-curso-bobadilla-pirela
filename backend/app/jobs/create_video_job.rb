class CreateVideoJob < ApplicationJob
  queue_as :default

  def perform(event_id, photo_urls)
    event = Event.find(event_id)

    output_dir = Rails.root.join('public', 'videos')
    FileUtils.mkdir_p(output_dir)

    output_file = output_dir.join("event_#{event_id}.mp4")

    photo_paths = event.event_pictures.map do |event_picture|
      next unless event_picture.picture.attached?

      file_path = output_dir.join("#{event_picture.id}.jpg")
      
      event_picture.picture.open do |file|
        File.open(file_path, 'wb') do |f|
          f.write(file.read)
        end
      end

      Rails.logger.info "Imagen descargada: #{file_path}"
      file_path.to_s
    end.compact

    concat_file = output_dir.join('concat_list.txt')
    File.open(concat_file, 'w') do |file|
      photo_paths.each do |path|
        file.puts("file '#{path}'")
      end
    end

    ffmpeg_command = "ffmpeg -y -f concat -safe 0 -i #{concat_file} -vf \"scale=308:234\" -c:v libx264 -crf 23 -pix_fmt yuv420p #{output_file}"

    Rails.logger.info "Ejecutando comando FFmpeg: #{ffmpeg_command}"
    system(ffmpeg_command)

    if File.exist?(output_file)
      event.video.attach(io: File.open(output_file), filename: "event_#{event_id}.mp4", content_type: 'video/mp4')
      Rails.logger.info "Video creado y adjuntado para el evento #{event_id}"
    else
      Rails.logger.error "Falló la creación del video para el evento #{event_id}"
    end
  end
end