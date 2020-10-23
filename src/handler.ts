/* eslint-disable no-console */
/* eslint-disable import/no-unresolved */
import prompts from 'prompts';
import { Constants, Type } from './constants';
import {
  createNewProject,
  generateNewTemplateCommand,
  generateNewEvent,
  generateNewTemplateEvent,
} from './scaffold';
import {
  templateCommandGenerator,
  eventGenerate,
  languageSelect, eventSelect, templateEventGenerator,
} from './questions';

export async function handleOption(option: string, data: string) {
  if (option === Constants.NEW) {
    const { language } = await prompts(languageSelect);
    // dependency
    await createNewProject(data, language);
  } else if (option === Constants.GEN) {
    if (data === Type.COMMAND) {
      const { name, category } = await prompts(templateCommandGenerator);
      await generateNewTemplateCommand(name, category)
        .then(() => console.log('Created.'))
        .catch((err) => console.log(err));
    } else if (data === Type.EVENT) {
      const { eventCustom } = await prompts(eventSelect);
      if (eventCustom === 'yes') {
        const { name, category } = await prompts(templateEventGenerator);
        await generateNewTemplateEvent(name, category);
      } else if (eventCustom === 'no') {
        const { events } = await prompts(eventGenerate);
        await generateNewEvent(events);
      }
    }
  }
}
