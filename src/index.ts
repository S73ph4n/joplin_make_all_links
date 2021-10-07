import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';

joplin.plugins.register({
	onStart: async function() {
		joplin.commands.register({
			name: 'makeAllLinks',
			label: 'Link to all notes mentionned in the current note.',
			iconName: 'fas fa-project-diagram',
			execute: async () => {
				var response = (await joplin.data.get(['notes']));
				var notes = response.items;
				let pageNum = 1;
				while (response.has_more){
					response = await joplin.data.get(['notes'], {page: pageNum++});
					//console.info(response);
					notes = notes.concat(response.items);
				}
				const currentNote = await joplin.workspace.selectedNote();	
				//const selectedText = (await joplin.commands.execute('selectedText') as string);
				var body = currentNote.body.split('\n');
				//console.info(body);

				for (var wordGpLength = 4; wordGpLength > 0; wordGpLength--){ //iterate over word group lengths (longer first)
					for (var n_line=0; n_line < body.length; n_line++){ //over every line
						var line = body[n_line].split(' ');
						for (var n_word=0; n_word <= line.length-wordGpLength; n_word++){
							var selectedText = line.slice(n_word, n_word+wordGpLength).join(' ');
							if (selectedText.length > 2){
								//console.info('Testing word group', wordGpLength, n_line, n_word, selectedText);

								var idLinkedNote = 0;
								for (let i in notes){
									//console.info(notes[i].title);
									if (notes[i].title.toLowerCase() === selectedText.toLowerCase() && currentNote.title.toLowerCase() !== selectedText.toLowerCase()){
										idLinkedNote = notes[i].id;	
										console.info('Found note with title ', notes[i].title, selectedText ,idLinkedNote);
										const linkToNewNote = '[' + selectedText + '](:/' + idLinkedNote + ')';
										const newLine = line.slice(0, n_word).concat([linkToNewNote], line.slice(n_word+wordGpLength)).join(' ');
										
										body = body.slice(0, n_line).concat([newLine], body.slice(n_line + 1));
										console.info(body);
										break;
									}
								}
							}
						}
					}
				}
				// Change the corrected body :
				//await joplin.data.put(['notes', currentNote.id], null, { body: body.join('\n')});
				await joplin.commands.execute("textSelectAll");
				await joplin.commands.execute("replaceSelection", body.join('\n'));
			},
		});
		
		joplin.views.toolbarButtons.create('makeAllLinks','makeAllLinks', ToolbarButtonLocation.EditorToolbar);
	},
});
