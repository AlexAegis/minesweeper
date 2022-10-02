import { fromEvent, map } from 'rxjs';
import { mouseUpAction$ } from './actions';
import { scope } from './scope';

export const documentMouseUp$ = fromEvent(document, 'mouseup');

scope.createEffect(documentMouseUp$.pipe(map(() => mouseUpAction$.makePacket())));
